package org.jboss.aerogear.unifiedpush.message.util;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.annotation.Resource;
import javax.ejb.Stateless;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.Destination;
import javax.jms.IllegalStateException;
import javax.jms.JMSException;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.ObjectMessage;
import javax.jms.Queue;
import javax.jms.Session;

import org.hornetq.api.core.Message;
import org.jboss.aerogear.unifiedpush.message.exception.MessageDeliveryException;

@Stateless
public class JmsClient {

    @Resource(mappedName = "java:/ConnectionFactory")
    private ConnectionFactory connectionFactory;

    @Resource(mappedName = "java:/JmsXA")
    private ConnectionFactory xaConnectionFactory;

    public JmsSender send(Serializable message) {
        return new JmsSender(message);
    }

    public JmsReceiver receive() {
        return new JmsReceiver();
    }

    public class JmsReceiver {

        private boolean transacted = false;
        private String selector = null;
        private Wait wait = new WaitIndefinitely();
        private int acknowledgeMode = Session.AUTO_ACKNOWLEDGE;
        private boolean autoClose = true;

        private Connection connection;

        public JmsReceiver() {
        }

        public JmsReceiver inTransaction() {
            this.transacted = true;
            return this;
        }

        public JmsReceiver withSelector(String selector) {
            this.selector = selector;
            return this;
        }

        public JmsReceiver noWait() {
            this.wait = new NoWait();
            return this;
        }

        public JmsReceiver withTimeout(long timeout) {
            this.wait = new WaitSpecificTime(timeout);
            return this;
        }

        public JmsReceiver withAcknowledgeMode(int acknowledgeMode) {
            this.acknowledgeMode = acknowledgeMode;
            return this;
        }

        public void close() {
            try {
                connection.close();
            } catch (JMSException e) {
                e.printStackTrace();
            }
        }

        public JmsReceiver noAutoClose() {
            this.autoClose = false;
            return this;
        }

        public ObjectMessage from(Queue queue) {
            try {
                if (transacted) {
                    connection = xaConnectionFactory.createConnection();
                } else {
                    connection = connectionFactory.createConnection();
                }
                Session session = connection.createSession(transacted, acknowledgeMode);
                MessageConsumer messageConsumer;
                if (selector != null) {
                    messageConsumer = session.createConsumer(queue, selector);
                } else {
                    messageConsumer = session.createConsumer(queue);
                }
                connection.start();
                ObjectMessage objectMessage;
                if (wait instanceof WaitIndefinitely) {
                    objectMessage = (ObjectMessage) messageConsumer.receive();
                } else if (wait instanceof NoWait) {
                    objectMessage = (ObjectMessage) messageConsumer.receiveNoWait();
                } else if (wait instanceof WaitSpecificTime) {
                    objectMessage = (ObjectMessage) messageConsumer.receive(((WaitSpecificTime) wait).getTime());
                } else {
                    throw new IllegalStateException("Unknown wait: " + wait.getClass());
                }
                return objectMessage;
            } catch (JMSException e) {
                throw new MessageDeliveryException("Failed to queue push message for further processing", e);
            } finally {
                if (connection != null && autoClose) {
                    try {
                        connection.close();
                    } catch (JMSException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    public class JmsSender {

        private Serializable message;
        private boolean transacted = false;
        private Map<String, String> properties = new LinkedHashMap<String, String>();
        private int autoAcknowledgeMode = Session.AUTO_ACKNOWLEDGE;

        public JmsSender(Serializable message) {
            this.message = message;
        }

        public JmsSender inTransaction() {
            this.transacted = true;
            return this;
        }

        public JmsSender withProperty(String name, String value) {
            this.properties.put(name, value);
            return this;
        }

        public JmsSender withDuplicateDetectionId(String duplicateDetectionId) {
            this.properties.put(org.hornetq.api.core.Message.HDR_DUPLICATE_DETECTION_ID.toString(), duplicateDetectionId);
            return this;
        }

        public void to(Destination destination) {
            Connection connection = null;
            try {
                if (transacted) {
                    connection = xaConnectionFactory.createConnection();
                } else {
                    connection = connectionFactory.createConnection();
                }
                Session session = connection.createSession(transacted, autoAcknowledgeMode);
                MessageProducer messageProducer = session.createProducer(destination);
                connection.start();
                ObjectMessage objectMessage = session.createObjectMessage(message);
                for (Entry<String, String> property : properties.entrySet()) {
                    objectMessage.setStringProperty(property.getKey(), property.getValue());
                }
                messageProducer.send(objectMessage);
            } catch (JMSException e) {
                throw new MessageDeliveryException("Failed to queue push message for further processing", e);
            } finally {
                if (connection != null) {
                    try {
                        connection.close();
                    } catch (JMSException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    private interface Wait {
    }

    private static class WaitIndefinitely implements Wait {
    }

    private static class NoWait implements Wait {
    }

    private static class WaitSpecificTime implements Wait {
        private long time;

        public WaitSpecificTime(long time) {
            super();
            this.time = time;
        }

        public long getTime() {
            return time;
        }
    }

}
