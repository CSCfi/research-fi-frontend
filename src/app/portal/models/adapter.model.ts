// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

export interface Adapter<T> {
  adapt(item: any): T;
  adaptMany?(item: any): T[];
}
