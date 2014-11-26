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
package org.jboss.aerogear.unifiedpush.bootstrap;

import org.keycloak.adapters.AdapterDeploymentContext;
import org.keycloak.representations.adapters.config.AdapterConfig;
import org.keycloak.util.StringPropertyReplacer;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.util.logging.Logger;

/**
 * @author <a href="mailto:bill@burkecentral.com">Bill Burke</a>
 * @version $Revision: 1 $
 */
public class KeycloakBootstrapListener implements ServletContextListener {

    private static final Logger logger = Logger.getLogger(KeycloakBootstrapListener.class.getSimpleName());

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        AdapterDeploymentContext deploymentContext = (AdapterDeploymentContext) sce.getServletContext().getAttribute(AdapterDeploymentContext.class.getName());
        AdapterConfig configServer = new AdapterConfig();
        configServer.setRealm("aerogear");

        configServer.setAuthServerUrl(StringPropertyReplacer.replaceProperties("${keycloak.url}"));
        configServer.setSslRequired("external");
        configServer.setResource("unified-push-server");
        configServer.setBearerOnly(true);
        configServer.setDisableTrustManager(true);

//        AdapterConfig configAdminUI = new AdapterConfig();
//        configAdminUI.setRealm("aerogear");
//        configAdminUI.setAuthServerUrl(StringPropertyReplacer.replaceProperties("${keycloak.url}"));
//        configServer.setSslRequired("external");
//        configAdminUI.setResource("unified-push-server-js");
//        configAdminUI.setPublicClient(true);

        deploymentContext.updateDeployment(configServer);
//        deploymentContext.updateDeployment(configAdminUI);

    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {

    }
}
