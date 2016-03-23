package org.jboss.aerogear.unifiedpush.message.serviceHolder;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Mockito.mock;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import javax.inject.Inject;

import org.jboss.aerogear.unifiedpush.test.archive.UnifiedPushArchive;
import org.jboss.arquillian.container.test.api.Deployment;
import org.jboss.arquillian.junit.Arquillian;
import org.jboss.shrinkwrap.api.spec.WebArchive;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(Arquillian.class)
public class TestServiceDisposal {

    private ServiceDestroyer<Object> mockDestroyer;
    private Object instance = new Object();

    @Deployment
    public static WebArchive archive() {
        return UnifiedPushArchive.forTestClass(TestAbstractServiceHolderClustered.class)
                .withMessaging()
                    .addPackage(ServiceDisposalScheduler.class.getPackage())
                    .deleteClass(ApnsServiceHolder.class)
                .withMockito()
                .as(WebArchive.class);
    }

    @Inject
    private ServiceDisposalScheduler scheduler;

    @Before
    public void setUp() {
        mockDestroyer = mock(ServiceDestroyer.class);
    }

    @Test
    public void test_that_get_nulls_the_reference() throws InterruptedException {
        DisposableReference<Object> disposableReference = new DisposableReference<Object>(instance, mockDestroyer);
        assertEquals(instance, disposableReference.get());
        assertNull(disposableReference.get());;
    }

    @Test
    public void test_that_disposal_nulls_the_reference() throws InterruptedException {
        DisposableReference<Object> disposableReference = new DisposableReference<Object>(instance, mockDestroyer);
        disposableReference.dispose();
        assertNull(disposableReference.get());;
    }

    @Test(timeout = 2000L)
    public void test_that_instance_is_disposed_after_delay() throws InterruptedException {
        final CountDownLatch latch = new CountDownLatch(1);
        ServiceDestroyer<Object> serviceDestroyer = new ServiceDestroyer<Object>() {
            public void destroy(Object instance) {
                latch.countDown();
            };
        };
        DisposableReference<Object> disposableReference = new DisposableReference<Object>(instance, serviceDestroyer);
        scheduler.scheduleForDisposal(disposableReference, 1000);
        latch.await();
        assertNull(disposableReference.get());
    }

    @Test(timeout = 2000)
    public void test_disposing_multiple_instances() throws InterruptedException {
        final int numberOfInstances = 100;
        final CountDownLatch latch = new CountDownLatch(numberOfInstances);
        ServiceDestroyer<Object> serviceDestroyer = new ServiceDestroyer<Object>() {
            public void destroy(Object instance) {
                latch.countDown();
            };
        };
        for (int i = 0; i < numberOfInstances; i++) {
            scheduler.scheduleForDisposal(new DisposableReference<Object>(instance, serviceDestroyer), 1000);
        }
        latch.await();
    }

    @Test(timeout = 3000)
    public void test_disposing_gracefully_when_terminated() throws InterruptedException {
        final int numberOfInstances = 100;
        final AtomicInteger numberOfInstancesTerminatedGracefully = new AtomicInteger();
        final CountDownLatch latch = new CountDownLatch(numberOfInstances);
        ServiceDestroyer<Object> serviceDestroyer = new ServiceDestroyer<Object>() {
            public void destroy(Object instance) {
                numberOfInstancesTerminatedGracefully.incrementAndGet();
                latch.countDown();
            };
        };
        for (int i = 0; i < numberOfInstances; i++) {
            scheduler.scheduleForDisposal(new DisposableReference<Object>(instance, serviceDestroyer), 100); // delay  is lesser than termination timeout
        }
        latch.await(2, TimeUnit.SECONDS);
        assertEquals("all instances should be terminated gracefully", numberOfInstances, numberOfInstancesTerminatedGracefully.get());
    }
}