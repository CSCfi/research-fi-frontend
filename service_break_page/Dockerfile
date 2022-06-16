# This file is part of the research.fi API service
#
# Copyright 2022 Ministry of Education and Culture, Finland
#
# :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
# :license: MIT

# Use non-root version of nginx
FROM docker-registry.default.svc:5000/researchfi/nginx-unprivileged
COPY service_break_page/html /usr/share/nginx/html
EXPOSE 8080