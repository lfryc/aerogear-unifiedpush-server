package org.jboss.aerogear.unifiedpush.message.event;

import java.io.Serializable;

public class TriggerMetricCollection implements Serializable {

    private String pushMessageInformationId;

    public TriggerMetricCollection(String pushMessageInformationId) {
        this.pushMessageInformationId = pushMessageInformationId;
    }

    public String getPushMessageInformationId() {
        return pushMessageInformationId;
    }

}
