FROM jboss/keycloak

# COPY keycloak/themes/reva/ /opt/jboss/keycloak/themes/reva/

CMD /opt/jboss/keycloak/bin/add-user-keycloak.sh -u $KEYCLOAK_USER -p $KEYCLOAK_PASSWORD

CMD ["-b", "0.0.0.0"]