# This file is part of the research.fi API service
#
# Copyright 2019 Ministry of Education and Culture, Finland
#
# :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
# :license: MIT

# Use non-root version of nginx
FROM nginxinc/nginx-unprivileged
COPY nginx_reverse_proxy/angular/qa/nginx.conf /etc/nginx/
EXPOSE 8080