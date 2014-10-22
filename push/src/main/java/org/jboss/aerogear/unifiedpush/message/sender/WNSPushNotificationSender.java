/**
 * JBoss, Home of Professional Open Source
 * Copyright Red Hat, Inc., and individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jboss.aerogear.unifiedpush.message.sender;

import ar.com.fernandospr.wns.WnsService;
import ar.com.fernandospr.wns.exceptions.WnsException;
import ar.com.fernandospr.wns.model.WnsNotificationResponse;
import ar.com.fernandospr.wns.model.WnsToast;
import ar.com.fernandospr.wns.model.builders.WnsToastBuilder;
import org.jboss.aerogear.unifiedpush.api.Variant;
import org.jboss.aerogear.unifiedpush.api.WindowsVariant;
import org.jboss.aerogear.unifiedpush.message.UnifiedPushMessage;
import org.jboss.aerogear.unifiedpush.service.ClientInstallationService;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.UriBuilder;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

@SenderType(WindowsVariant.class)
public class WNSPushNotificationSender implements PushNotificationSender {
    private final Logger logger = Logger.getLogger(APNsPushNotificationSender.class.getName());

    private static final String PAGE_KEY = "page";
    private static final String CORDOVA = "cordova";
    static final String CORDOVA_PAGE = "/Plugins/org.jboss.aerogear.cordova.push/P.xaml";

    @Inject
    private ClientInstallationService clientInstallationService;

    @Override
    public void sendPushMessage(Variant variant, Collection<String> clientIdentifiers, UnifiedPushMessage pushMessage, NotificationSenderCallback senderCallback) {
        // no need to send empty list
        if (clientIdentifiers.isEmpty()) {
            return;
        }

        final WindowsVariant windowsVariant = (WindowsVariant) variant;
        WnsService wnsService = new WnsService(windowsVariant.getSid(), windowsVariant.getClientSecret(), false);

        WnsToast toast = createToastMessage(pushMessage);
        try {
            Set<String> expiredClientIdentifiers = new HashSet<String>(clientIdentifiers.size());
            final List<WnsNotificationResponse> responses = wnsService.pushToast(new ArrayList<String>(clientIdentifiers), toast);
            for (WnsNotificationResponse response : responses) {
                if (response.code == HttpServletResponse.SC_GONE) {
                    expiredClientIdentifiers.add(response.channelUri);
                }
            }
            if (!expiredClientIdentifiers.isEmpty()) {
                logger.log(Level.INFO, String.format("Deleting '%d' expired WNS installations", expiredClientIdentifiers.size()));
                clientInstallationService.removeInstallationsForVariantByDeviceTokens(variant.getVariantID(), expiredClientIdentifiers);
            }
        } catch (WnsException exception) {
            senderCallback.onError(exception.getMessage());
        }

        logger.log(Level.INFO, "Message to WNS has been submitted");
        senderCallback.onSuccess();
    }

    WnsToast createToastMessage(UnifiedPushMessage pushMessage) {
        final WnsToastBuilder builder = new WnsToastBuilder().bindingTemplateToastText01(pushMessage.getAlert());
        final Map<String, Object> data = pushMessage.getData();
        final String page = (String) data.remove(PAGE_KEY);
        if (page != null) {
            final UriBuilder uriBuilder = UriBuilder.fromPath("");
            for (Map.Entry<String, Object> entry : data.entrySet()) {
                uriBuilder.queryParam(entry.getKey(), entry.getValue());
            }
            final String query = uriBuilder.build().getQuery();
            builder.launch(CORDOVA.equals(page) ? CORDOVA_PAGE : page + "?" + query);
        }
        return builder.build();
    }
}
