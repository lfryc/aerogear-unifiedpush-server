/**
 * JBoss, Home of Professional Open Source
 * Copyright Red Hat, Inc., and individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jboss.aerogear.unifiedpush.message.jms;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.fail;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import javax.annotation.Resource;
import javax.ejb.MessageDriven;
import javax.ejb.TransactionAttribute;
import javax.ejb.TransactionManagement;
import javax.enterprise.event.Event;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.jms.ObjectMessage;
import javax.jms.Queue;
import javax.jms.Session;

import org.hornetq.api.core.Message;
import org.jboss.aerogear.unifiedpush.api.AndroidVariant;
import org.jboss.aerogear.unifiedpush.api.PushMessageInformation;
import org.jboss.aerogear.unifiedpush.api.SimplePushVariant;
import org.jboss.aerogear.unifiedpush.api.Variant;
import org.jboss.aerogear.unifiedpush.message.AbstractJMSTest;
import org.jboss.aerogear.unifiedpush.message.MockProviders;
import org.jboss.aerogear.unifiedpush.message.UnifiedPushMessage;
import org.jboss.aerogear.unifiedpush.message.event.TriggerMetricCollection;
import org.jboss.aerogear.unifiedpush.message.exception.PushNetworkUnreachableException;
import org.jboss.aerogear.unifiedpush.message.exception.SenderResourceNotAvailableException;
import org.jboss.aerogear.unifiedpush.message.holder.MessageHolderWithTokens;
import org.jboss.aerogear.unifiedpush.message.util.JmsClient;
import org.jboss.aerogear.unifiedpush.message.util.JmsClient.JmsReceiver;
import org.jboss.aerogear.unifiedpush.test.archive.UnifiedPushArchive;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit.Arquillian;
import org.jboss.arquillian.junit.InSequence;
import org.jboss.shrinkwrap.api.spec.WebArchive;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(Arquillian.class)
public class TestMessageDeduplication extends AbstractJMSTest {

    @Deployment
    public static WebArchive archive() {
        return UnifiedPushArchive.forTestClass(TestMessageDeduplication.class)
                .withMessaging()
                    .addClasses(MessageHolderWithTokensProducer.class, MessageHolderWithTokensConsumer.class, AbstractJMSMessageListener.class)
                    .addAsWebInfResource("jboss-ejb3-message-holder-with-tokens.xml", "jboss-ejb3.xml")
                .withMockito()
                    .addClasses(MockProviders.class)
                .addPackage(Message.class.getPackage())
                .addClasses(JmsClient.class, TriggerMetricCollectionMDB.class)
                .addAsWebInfResource("hornetq-configuration.xml")
                .as(WebArchive.class);
    }

//    @Inject @DispatchToQueue
//    private Event<TriggerMetricCollection> event;



    @Resource(mappedName = "java:/queue/TriggerMetricCollectionQueue")
    private Queue triggerMetricCollectionQueue;

    @Before
    public void setUp() {
    }

//    @Test
//    public void testDedup() throws InterruptedException {
//        TriggerMetricCollection msg = new TriggerMetricCollection(UUID.randomUUID().toString());
//
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//
//
//        assertNotNull(receive().from(triggerMetricCollectionQueue));
//        assertNull(receive().withTimeout(1000).from(triggerMetricCollectionQueue));
//
//        msg = new TriggerMetricCollection(msg.getPushMessageInformationId());
//
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//        send(msg).withDuplicateDetectionId(msg.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//
//        assertNull(receive().withTimeout(1000).from(triggerMetricCollectionQueue));
//    }

//    @Test
//    @InSequence(1)
//    public void testAcknowledge1() throws InterruptedException {
//        TriggerMetricCollection trigger = new TriggerMetricCollection(UUID.randomUUID().toString());
//
//        send(trigger).withDuplicateDetectionId(trigger.getPushMessageInformationId()).to(triggerMetricCollectionQueue);
//
//        JmsReceiver jmsReceiver = receive().withAcknowledgeMode(Session.CLIENT_ACKNOWLEDGE);
//        ObjectMessage message = jmsReceiver.from(triggerMetricCollectionQueue);
//        assertNotNull(message);
//        jmsReceiver.close();
//    }
//
//    @Test
//    @InSequence(2)
//    public void testAcknowledge2() throws InterruptedException {
//        ObjectMessage message = receive().withAcknowledgeMode(Session.CLIENT_ACKNOWLEDGE).from(triggerMetricCollectionQueue);
//        assertNotNull(message);
//    }

  @Test
  @InSequence(1)
  public void testTransactedMDBRedelivery() throws InterruptedException {
      TriggerMetricCollection trigger = new TriggerMetricCollection(UUID.randomUUID().toString());

      send(trigger).withDuplicateDetectionId(trigger.getPushMessageInformationId()).to(triggerMetricCollectionQueue);

      Thread.sleep(5000);
  }
}
