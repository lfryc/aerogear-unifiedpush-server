package org.jboss.aerogear.unifiedpush.message.serviceHolder;

import java.util.concurrent.TimeUnit;

import javax.annotation.Resource;
import javax.ejb.Stateless;
import javax.enterprise.concurrent.ManagedScheduledExecutorService;

/**
 * Allows to scheduled instantiated services for disposal.
 *
 * Gracefully disposes services on a container shutdown.
 */
@Stateless
public class ServiceDisposalScheduler {

    @Resource
    private ManagedScheduledExecutorService scheduler;

    /**
     * Schedules a service instance for disposal if not used.
     * @param reference a reference to service that will be disposed later
     * @param delay a delay which need to pass before the reference can be disposed
     */
    public void scheduleForDisposal(DisposableReference<?> reference, long delay) {
        scheduler.schedule(new DisposeTask(reference), delay, TimeUnit.MILLISECONDS);
    }

    private static class DisposeTask implements Runnable {

        private DisposableReference<?> reference;

        public DisposeTask(DisposableReference<?> reference) {
            this.reference = reference;
        }

        @Override
        public void run() {
            reference.dispose();
        }
    }
}