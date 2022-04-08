# For AMD64 devices
FROM jboss/keycloak

# For Mac M1
# FROM wizzn/keycloak:12


COPY keycloak/themes/reva/ /opt/jboss/keycloak/themes/reva/
COPY keycloak/configuration/standalone.xml /opt/jboss/keycloak/standalone/configuration/

CMD /opt/jboss/keycloak/bin/add-user-keycloak.sh -u $KEYCLOAK_USER -p $KEYCLOAK_PASSWORD

CMD ["-b", "0.0.0.0"]