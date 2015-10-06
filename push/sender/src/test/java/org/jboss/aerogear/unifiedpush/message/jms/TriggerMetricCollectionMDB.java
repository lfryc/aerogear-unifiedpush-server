package org.jboss.aerogear.unifiedpush.message.jms;

import javax.annotation.Resource;
import javax.ejb.ActivationConfigProperty;
import javax.ejb.MessageDriven;
import javax.ejb.MessageDrivenContext;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionAttributeType;
import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.MessageListener;
import javax.jms.ObjectMessage;

@MessageDriven(
        name = "TriggerMetricCollection",
        activationConfig = {
           @ActivationConfigProperty( propertyName = "destinationType", propertyValue = "javax.jms.Queue"),
           @ActivationConfigProperty( propertyName = "destination", propertyValue ="queue/TriggerMetricCollectionQueue")
        }
     )
@TransactionAttribute(TransactionAttributeType.REQUIRED)
public class TriggerMetricCollectionMDB implements MessageListener {

    @Resource
    private MessageDrivenContext context;

    @Override
    public void onMessage(Message message) {
        try {
            if (!message.getJMSRedelivered()) {
                System.out.println("mark for redelivery");
                throw new IllegalStateException();
            } else {
                System.out.println("redelivered");
            }
        } catch (JMSException e) {
            e.printStackTrace();
        }

    }

}
