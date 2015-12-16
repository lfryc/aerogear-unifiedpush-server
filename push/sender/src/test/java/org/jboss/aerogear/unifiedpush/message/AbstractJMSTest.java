/**
 * JBoss, Home of Professional Open Source
 * Copyright Red Hat, Inc., and individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jboss.aerogear.unifiedpush.message;

import java.io.Serializable;

import javax.annotation.Resource;
import javax.inject.Inject;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.JMSException;
import javax.jms.MessageConsumer;
import javax.jms.MessageProducer;
import javax.jms.ObjectMessage;
import javax.jms.Queue;
import javax.jms.Session;

import org.jboss.aerogear.unifiedpush.message.exception.MessageDeliveryException;
import org.jboss.aerogear.unifiedpush.message.util.JmsClient;
import org.jboss.aerogear.unifiedpush.message.util.JmsClient.JmsReceiver;
import org.jboss.aerogear.unifiedpush.message.util.JmsClient.JmsSender;

public abstract class AbstractJMSTest {

    @Resource(mappedName = "java:/ConnectionFactory")
    private ConnectionFactory connectionFactory;

    @Inject
    private JmsClient jmsClient;

    protected JmsSender send(Serializable msg) {
        return jmsClient.send(msg);
    }

    protected JmsReceiver receive() {
        return jmsClient.receive();
    }

    @Deprecated
    protected void send(Queue pushMessageQueue, Serializable msg) {
        Connection connection = null;
        try {
            connection = connectionFactory.createConnection();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            MessageProducer messageProducer = session.createProducer(pushMessageQueue);
            connection.start();
            ObjectMessage objectMessage = session.createObjectMessage(msg);
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

    @Deprecated
    protected void send(Queue pushMessageQueue, Serializable msg, String propertyName, String propertyValue) {
        Connection connection = null;
        try {
            connection = connectionFactory.createConnection();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            MessageProducer messageProducer = session.createProducer(pushMessageQueue);
            connection.start();
            ObjectMessage objectMessage = session.createObjectMessage(msg);
            objectMessage.setStringProperty(propertyName, propertyValue);
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

    @Deprecated
    protected <T extends Serializable> T receive(Queue queue) {
        Connection connection = null;
        try {
            connection = connectionFactory.createConnection();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            MessageConsumer messageConsumer = session.createConsumer(queue);
            connection.start();
            ObjectMessage objectMessage = (ObjectMessage) messageConsumer.receiveNoWait();
            if (objectMessage != null) {
                return (T) objectMessage.getObject();
            } else {
                return null;
            }
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

    @Deprecated
    protected <T extends Serializable> T receive(Queue queue, String propertyName, String propertyValue) {
        Connection connection = null;
        try {
            connection = connectionFactory.createConnection();
            Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
            MessageConsumer messageConsumer = session.createConsumer(queue, String.format("%s = '%s'", propertyName, propertyValue));
            connection.start();
            ObjectMessage objectMessage = (ObjectMessage) messageConsumer.receiveNoWait();
            if (objectMessage != null) {
                return (T) objectMessage.getObject();
            } else {
                return null;
            }
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
