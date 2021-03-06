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
package org.jboss.aerogear.unifiedpush.test.archive;

import org.jboss.shrinkwrap.api.Archive;
import org.jboss.shrinkwrap.api.container.LibraryContainer;
import org.jboss.shrinkwrap.api.container.ResourceContainer;
import org.jboss.shrinkwrap.api.container.ServiceProviderContainer;
import org.jboss.shrinkwrap.api.container.WebContainer;

/**
 * An archive for specifying Arquillian micro-deployments with selected parts of UPS
 */
public interface UnifiedPushArchive extends Archive<UnifiedPushArchive>, LibraryContainer<UnifiedPushArchive>,
        WebContainer<UnifiedPushArchive>, ResourceContainer<UnifiedPushArchive>, ServiceProviderContainer<UnifiedPushArchive> {

    UnifiedPushArchive addMavenDependencies(String... deps);

    public abstract UnifiedPushArchive withMockito();

    public abstract UnifiedPushArchive withServices();

    public abstract UnifiedPushArchive withDAOs();

    public abstract UnifiedPushArchive withMessageModel();

    public abstract UnifiedPushArchive withUtils();

    public abstract UnifiedPushArchive withApi();

    public abstract UnifiedPushArchive withMessaging();
}
