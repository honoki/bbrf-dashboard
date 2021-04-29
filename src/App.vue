<template>
    <div id="app">
        <nav class="navbar navbar-dark bg-dark">
            <form>
                <div class="form-row align-items-center">
                    <div class="col-auto">
                        <label class="sr-only" for="inlineFormInputGroup">Username</label>
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <a href="https://github.com/honoki/bbrf-server" class="nohref">
                                    <div class="input-group-text">
                                        BBRF server
                                    </div>
                                </a>
                            </div>
                            <input type="text" size="100" class="form-control" id="inlineFormInputGroup" placeholder="http://localhost:5984/bbrf" v-model="couchdb">
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <div class="input-group-text">username</div>
                            </div>
                            <input type="text" size="5" class="form-control" id="inlineFormInputGroup" placeholder="bbrf" v-model="couchdb_user">
                        </div>
                    </div>
                    <div class="col-auto">
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <div class="input-group-text">password</div>
                            </div>
                            <input type="password" size="10" class="form-control" id="inlineFormInputGroup" v-model="couchdb_pass">
                        </div>
                    </div>
                    <div class="col-auto">
                        <button type="submit" class="btn btn-primary mb-2" @click.prevent="connect_server">Connect</button>
                    </div>
                </div>
            </form>
        </nav>
        <div class="container">
            <p><br /></p>
            <b-tabs pills>
                <b-tab title="Programs">
                    <p><br /></p>

                    <div class="row">
                        <div class="col-sm-2">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h5 class="card-title">{{ stats.programs.toLocaleString() }}</h5>
                                    <p class="card-text">Programs</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-2">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h5 class="card-title">{{ stats.domains.toLocaleString() }}</h5>
                                    <p class="card-text">Domains</p>
                                    <p class="small">{{stats.domains_resolved.toLocaleString() }} resolved ({{ ((stats.domains_resolved*100/stats.domains).toFixed(2)) }}%)</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-2">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h5 class="card-title">{{ stats.ips.toLocaleString() }}</h5>
                                    <p class="card-text">IPs</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-2">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h5 class="card-title">{{ stats.urls.toLocaleString() }}</h5>
                                    <p class="card-text">URLs</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-2">
                            <div class="card">
                                <div class="card-body text-center">
                                    <h5 class="card-title">{{ stats.services.toLocaleString() }}</h5>
                                    <p class="card-text">Services</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p><br /></p>

                    <p><br /></p>
                    <div class="form-group">
                        <label for="programSelect">Select a program below to load data tables. <span v-b-tooltip title="Only showing enabled programs with a defined inscope">
                                <b-icon icon="info-circle-fill" scale="1" variant="black"></b-icon>
                            </span></label>
                        <select @change="select_program" v-model="program" class="form-control" id="programSelect">
                            <option value="SHOWALL">Load all programs (this may be heavy on your browser)</option>
                            <option v-for="program in programs" v-bind:key="program.id">{{ program.id }}</option>
                        </select>
                    </div>
                    <div align="right" v-if="program_doc && program_doc.hasOwnProperty('doc')">
                        <b-button v-b-toggle.collapse-1 variant="outline-secondary">Show program details</b-button>
                        <b-collapse id="collapse-1" class="mt-2">
                            <b-card align="left">
                                <pre><code>{{ program_doc.doc }}</code></pre>
                            </b-card>
                        </b-collapse>
                    </div>


                    <br />

                    <div>
                        <b-tabs>
                            <b-tab v-for="(docs, doctype) in docstore" :key="doctype" :title="docs.display_value" @click.prevent="active_tab=doctype">
                                <div v-if="doctype == 'domains'">
                                    <br />
                                    <div class="card">
                                        <div class="card-body">
                                            <b-form-radio v-model="docstore.domains.filter_domains" name="domain-filter" value="all">Show all</b-form-radio>
                                            <b-form-radio v-model="docstore.domains.filter_domains" name="domain-filter" value="resolved">Resolved only</b-form-radio>
                                            <b-form-radio v-model="docstore.domains.filter_domains" name="domain-filter" value="unresolved">Unresolved only</b-form-radio>
                                        </div>
                                    </div>
                                </div>
                                <br />
                                <b-pagination v-model="docs.table.current_page" :total-rows="records_filtered(doctype).length" :per-page="table_pagination_records" :aria-controls="'tbl-'+doctype" align="center"></b-pagination>
                                <b-table show-empty striped bordered :busy="docs.table.isBusy" :items="records_filtered(doctype)" :fields="fields_filtered(doctype)" :options="docs.table.options" :id="'tbl-'+doctype" :per-page="table_pagination_records" :current-page="docs.table.current_page">
                                    <template #table-busy>
                                        <div class="text-center">
                                            <p>
                                                <b-spinner class="align-middle"></b-spinner>
                                            </p>
                                            <p><strong>Loading...</strong></p>
                                        </div>
                                    </template>
                                    <template slot="top-row" slot-scope="{ fields }">
                                        <td v-for="field in fields" :key="field.key">
                                            <input @change="search_table" width="80%" v-model="docs.table.filters[field.key]" placeholder="filter" class="form-control">
                                        </td>
                                    </template>
                                    <template slot="bottom-row" v-if="program" :set="total = 999">
                                        <td colspan="100%" align="center" class="small">
                                            Loaded {{ docs.records.length.toLocaleString() }} of
                                            <span v-if="doctype != 'domains' || docs.filter_domains == 'all'" :set="total = stats[doctype]">
                                                {{ total.toLocaleString() }}
                                            </span>
                                            <span v-else>
                                                <span :set="total = stats[''+doctype+'_'+docs.filter_domains]">
                                                    {{ total.toLocaleString() }}
                                                </span>
                                            </span>
                                            records
                                            <span v-if="total > docs.records.length">&bull; <a href="#" @click.prevent="load_records(doctype)">load {{ (Math.min(page_size, total - docs.records.length)).toLocaleString() }} more</a></span>

                                        </td>
                                    </template>
                                </b-table>
                                <div align="right" style="margin-bottom:2em;">
                                    <b-button v-clipboard:copy="format_clipboard(records_filtered(doctype))" variant="outline-secondary" size="sm">Copy to clipboard</b-button>
                                </div>
                                <b-pagination v-model="docs.table.current_page" :total-rows="records_filtered(doctype).length" :per-page="table_pagination_records" :aria-controls="'tbl-'+doctype" align="center"></b-pagination>

                            </b-tab>
                        </b-tabs>
                    </div>
                </b-tab>

                <b-tab title="Alerts">
                    <div align="right">
                        <b-pagination v-model="alerts.table.current_page" :total-rows="alerts.records.length" :per-page="table_pagination_records" aria-controls="tbl-alerts" align="center"></b-pagination>
                        <b-table show-empty striped bordered borderless hover id="tbl-alerts" :items="alerts.records" :per-page="table_pagination_records" :current-page="alerts.table.current_page" :fields="alerts.table.fields" :options="alerts.table.options" :busy="alerts.table.isBusy">
                            <template #table-busy>
                                <div class="text-center">
                                    <p>
                                        <b-spinner class="align-middle"></b-spinner>
                                    </p>
                                    <p><strong>Loading...</strong></p>
                                </div>
                            </template>
                            <template #cell(key)="data">
                                <span v-b-tooltip :title="new Date(data.item.key * 1000) | moment('dddd, MMMM Do YYYY, h:mm:ss a')">{{new Date(data.item.key*1000) | moment("from") }}</span>
                            </template>
                            <template slot="bottom-row">
                                <td colspan="100%" align="center" class="small">
                                    <span><a href="#" @click.prevent="load_records('alerts')">load more</a></span></td>
                            </template>
                        </b-table>
                        <b-pagination v-model="alerts.table.current_page" :total-rows="alerts.records.length" :per-page="table_pagination_records" aria-controls="tbl-alerts" align="center"></b-pagination>
                    </div>
                </b-tab>
            </b-tabs>

        </div>
        <footer class="footer">
            <div class="container" id="footer">
                <center>
                    <hr />
                    <p class="small">
                        Created with &hearts; by <a href="https://twitter.com/honoki">@honoki</a>
                        &bull;
                        <a href="https://github.com/honoki/bbrf-dashboard">GitHub</a>
                    </p>
                </center>
            </div>
        </footer>
    </div>

</template>

<script>
    import {
        BTabs,
        BTab,
        BTable,
        BPagination,
        BFormRadio,
        BSpinner,
        BCollapse,
        BButton,
        BCard,
        VBToggle,
        VBTooltip,
    } from 'bootstrap-vue'

    import PouchDB from 'pouchdb'
    import 'bootstrap/dist/css/bootstrap.css'
    import 'bootstrap-vue/dist/bootstrap-vue.css'

    export default {
        name: 'App',
        components: {
            BTable,
            BPagination,
            BTabs,
            BTab,
            BFormRadio,
            BSpinner,
            BCollapse,
            BButton,
            BCard,
        },
        directives: {
            'b-toggle': VBToggle,
            'b-tooltip': VBTooltip,
        },
        data: function() {
            return {
                title: "BBRF dashboard",
                couchdb: localStorage.getItem('couchdb'),
                couchdb_user: localStorage.getItem('couchdb-user'),
                couchdb_pass: localStorage.getItem('couchdb-pass'),
                program: null,
                stats: {
                    programs: 0,
                    domains: 0,
                    domains_resolved: 0,
                    domains_unresolved: 0,
                    ips: 0,
                    urls: 0,
                    services: 0
                },
                programs: [],
                alerts: {
                    records: [], // will be populated by PouchDB
                    table: {
                        isBusy: false,
                        current_page: 1,
                        fields: [{
                                key: 'key',
                                label: 'Date',
                                sortable: true,
                            },
                            {
                                key: 'value[0]',
                                label: 'Message'
                            },
                            {
                                key: 'value[1]',
                                label: 'Source',
                                sortable: true
                            }
                        ],
                        filters: {
                            key: '',
                            id: '',
                        },
                    }
                },
                docstore: {
                    domains: {
                        filter_domains: 'all',
                        display_value: 'Domains',
                        records: [], // will be populated by PouchDB
                        table: {
                            isBusy: false,
                            fields: [{
                                    key: 'id',
                                    label: 'Domain',
                                    sortable: true
                                },
                                {
                                    key: 'doc.ips',
                                    label: 'IPs',
                                    sortable: false
                                },
                                {
                                    key: 'doc.source',
                                    label: 'Source',
                                    sortable: true
                                },
                                {
                                    key: 'doc.program',
                                    label: 'Program',
                                    sortable: false
                                }
                            ],
                            filters: {
                                id: '',
                                'doc.ips': '',
                                'doc.source': '',
                                'doc.program': ''
                            },
                            current_page: 1
                        }
                    },
                    ips: {
                        display_value: 'IPs',
                        records: [], // will be populated by PouchDB
                        table: {
                            isBusy: false,
                            fields: [{
                                    key: 'id',
                                    label: 'IP',
                                    sortable: true
                                },
                                {
                                    key: 'doc.domains',
                                    label: 'Domains',
                                    sortable: false
                                },
                                {
                                    key: 'doc.source',
                                    label: 'Source',
                                    sortable: true
                                },
                                {
                                    key: 'doc.program',
                                    label: 'Program',
                                    sortable: false
                                }
                            ],
                            filters: {
                                id: '',
                                'doc.domains': '',
                                'doc.source': '',
                                'doc.program': ''
                            },
                            current_page: 1
                        }
                    },
                    urls: {
                        display_value: 'URLs',
                        records: [], // will be populated by PouchDB
                        table: {
                            isBusy: false,
                            fields: [{
                                    key: 'id',
                                    label: 'URL',
                                    sortable: false
                                },
                                {
                                    key: 'doc.hostname',
                                    label: 'Hostname',
                                    sortable: true
                                },
                                {
                                    key: 'doc.port',
                                    label: 'Port',
                                    sortable: true
                                },
                                {
                                    key: 'doc.status',
                                    label: 'Status',
                                    sortable: true
                                },
                                {
                                    key: 'doc.content_length',
                                    label: 'Content Length',
                                    sortable: true
                                },
                                {
                                    key: 'doc.source',
                                    label: 'Source',
                                    sortable: true
                                },
                                {
                                    key: 'doc.program',
                                    label: 'Program',
                                    sortable: false
                                }
                            ],
                            filters: {
                                id: '',
                                'doc.hostname': '',
                                'doc.port': '',
                                'doc.status': '',
                                'doc.content_length': '',
                                'doc.source': '',
                                'doc.program': ''
                            },
                            current_page: 1

                        }
                    },
                    services: {
                        display_value: 'Services',
                        records: [], // will be populated by PouchDB
                        table: {
                            isBusy: false,
                            fields: [{
                                    key: 'doc.ip',
                                    label: 'IP',
                                    sortable: false
                                },
                                {
                                    key: 'doc.port',
                                    label: 'Port',
                                    sortable: true
                                },
                                {
                                    key: 'doc.service',
                                    label: 'Service',
                                    sortable: true
                                },
                                {
                                    key: 'doc.source',
                                    label: 'Source',
                                    sortable: true
                                },
                                {
                                    key: 'doc.program',
                                    label: 'Program',
                                    sortable: false
                                }
                            ],
                            filters: {
                                'doc.ip': '',
                                'doc.port': '',
                                'doc.service': '',
                                'doc.source': '',
                                'doc.program': ''
                            },
                            current_page: 1

                        }
                    }
                },
                table_pagination_records: 100,
                page_size: 2000,
                last_refresh: 0,
                is_updating: false,
                active_tab: 'domains'
            }
        },
        computed: {
            fields_filtered: function() {
                let vm = this
                return function(doctype) {
                    var documents = vm.docstore[doctype]
                    var results = []
                    if (!vm.program) {
                        results = documents.table.fields
                    } else {
                        results = documents.table.fields.filter(function(field) {
                            if (field.key != 'doc.program') return true
                        })
                    }

                    // filter out IP addresses if we're looking at unresolved data
                    if (doctype == 'domains' && documents.filter_domains == 'unresolved') {
                        results = results.filter(function(field) {
                            if (field.key != 'doc.ips') return true
                        })
                    }

                    return results
                }
            },

            records_filtered: function() {
                // only return rows that match the filter value

                let vm = this

                return function(doctype) {
                    var documents = vm.docstore[doctype]
                    var results = documents.records

                    results = results.filter(function(row) {

                        var all_fields_match = true || row

                        // compare every field of the row to the filters
                        for (var i in documents.table.fields) {
                            var field = documents.table.fields[i].key
                            if (field in documents.table.filters && documents.table.filters[field].length > 0) {

                                var filter = documents.table.filters[field]

                                var value = eval('row.' + field)
                                if (value && !value.toString().includes(filter)) {
                                    all_fields_match = false
                                } else if (!value) {
                                    all_fields_match = false
                                }
                                // there's a filter set, compare it to the row
                            }
                        }

                        return all_fields_match
                    })

                    return results
                }
            },

            program_doc: function() {

                let vm = this
                var document = this.programs.filter(function(program) {
                    if (program.id == vm.program) return true
                })[0]

                return document
            }
        },
        created: function() {
            if (this.couchdb) this.connect_server();
        },
        methods: {
            connect_server: function() {
                if (this.couchdb) {
                    var options = {}

                    if (this.couchdb_user && this.couchdb_pass) {
                        options = {
                            'auth': {
                                'username': this.couchdb_user,
                                'password': this.couchdb_pass
                            }
                        }
                    }

                    this.db = new PouchDB(this.couchdb, options)
                    localStorage.setItem('couchdb', this.couchdb)
                    localStorage.setItem('couchdb-user', this.couchdb_user)
                    localStorage.setItem('couchdb-pass', this.couchdb_pass)

                    this.get_programs()
                    this.get_stats()
                    this.get_alerts()
                    this.listen_for_changes()
                }
            },
            get_domains: function(get_more = false) {

                let me = this

                var options = {
                    reduce: false,
                    include_docs: true,
                    limit: this.page_size // limit the default to first x records and fetch more when hitting the end of the table
                }

                // pagination is requested:
                if (get_more) {
                    options.skip = this.docstore.domains.records.length
                } else {
                    this.docstore.domains.records = []
                    this.docstore.domains.table.isBusy = true
                }

                if (this.program) options.key = this.program
                var suffix = ''
                if (this.docstore.domains.filter_domains != 'all') {
                    suffix = '_' + this.docstore.domains.filter_domains
                }

                this.db.query('bbrf/domains' + suffix, options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.docstore.domains.records.push(response.rows[i])
                    }
                    me.docstore.domains.table.isBusy = false
                }).catch(function() {

                })
            },
            get_ips: function(get_more = false) {

                let me = this

                var options = {
                    reduce: false,
                    include_docs: true,
                    limit: this.page_size // limit the default to first x records and fetch more when hitting the end of the table
                }

                // pagination is requested:
                if (get_more) {
                    options.skip = this.docstore.ips.records.length
                } else {
                    this.docstore.ips.records = []
                    this.docstore.ips.table.isBusy = true
                }

                if (this.program) options.key = this.program

                this.db.query('bbrf/ips', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.docstore.ips.records.push(response.rows[i])
                    }
                    me.docstore.ips.table.isBusy = false
                }).catch(function() {

                })
            },
            get_urls: function(get_more = false) {
                let me = this

                var options = {
                    reduce: false,
                    include_docs: true,
                    limit: this.page_size // limit the default to first x records and fetch more when hitting the end of the table
                }

                // pagination is requested:
                if (get_more) {
                    options.skip = this.docstore.urls.records.length
                } else {
                    this.docstore.urls.records = []
                    this.docstore.urls.table.isBusy = true
                }

                if (this.program) options.key = this.program

                this.db.query('bbrf/urls_by_program', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.docstore.urls.records.push(response.rows[i])
                    }
                    me.docstore.urls.table.isBusy = false
                }).catch(function() {

                })
            },
            get_services: function(get_more = false) {
                let me = this

                var options = {
                    reduce: false,
                    include_docs: true,
                    limit: this.page_size // limit the default to first x records and fetch more when hitting the end of the table
                }

                // pagination is requested:
                if (get_more) {
                    options.skip = this.docstore.services.records.length
                } else {
                    this.docstore.services.records = []
                    this.docstore.services.table.isBusy = true
                }

                if (this.program) options.key = this.program

                this.db.query('bbrf/services', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.docstore.services.records.push(response.rows[i])
                    }
                    me.docstore.services.table.isBusy = false
                }).catch(function() {

                })
            },
            get_programs: function() {
                let me = this
                this.programs = []

                var options = {
                    reduce: false,
                    include_docs: true
                }

                this.db.query('bbrf/programs', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        if (response.rows[i]['value'] > 0 && !response.rows[i]['doc']['disabled'])
                            me.programs.push(response.rows[i])
                    }
                }).catch(function() {

                })
            },
            get_alerts: function(get_more = false) {
                let me = this
                var options = {
                    descending: true,
                    limit: this.page_size
                }

                // pagination is requested:
                if (get_more) {
                    options.skip = me.alerts.records.length
                } else {
                    this.alerts.records = []
                    this.alerts.table.isBusy = true
                    console.log("busy" + this.alerts.table.isBusy)
                }

                this.db.query('bbrf/alerts', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.alerts.records.push(response.rows[i])
                    }
                    me.alerts.table.isBusy = false
                    console.log("busy" + me.alerts.table.isBusy)
                }).catch(function() {

                })
                
            },
            get_stats: function() {
                let me = this

                // reset all counters
                for (var i = 0; i < this.stats.length; i++) {
                    this.stats[i] = 0;
                }

                var options = {
                    reduce: true
                }

                if (this.program) options.key = this.program

                this.db.query('bbrf/programs', {
                    reduce: true
                }).then(function(response) {
                    me.stats.programs = response.rows.length > 0 ? response.rows[0].value : 0
                }).catch(function() {})
                this.db.query('bbrf/domains', options).then(function(response) {
                    me.stats.domains = response.rows.length > 0 ? response.rows[0].value : 0
                }).catch(function() {})
                this.db.query('bbrf/domains_resolved', options).then(function(response) {
                    me.stats.domains_resolved = response.rows.length > 0 ? response.rows[0].value : 0
                }).catch(function() {})
                this.db.query('bbrf/domains_unresolved', options).then(function(response) {
                    me.stats.domains_unresolved = response.rows.length > 0 ? response.rows[0].value : 0
                }).catch(function() {})
                this.db.query('bbrf/urls_by_program', options).then(function(response) {
                    me.stats.urls = response.rows.length > 0 ? response.rows[0].value : 0
                }).catch(function() {})
                this.db.query('bbrf/ips', options).then(function(response) {
                    me.stats.ips = response.rows.length > 0 ? response.rows[0].value : 0
                }).catch(function() {})
                this.db.query('bbrf/services', options).then(function(response) {
                    me.stats.services = response.rows.length > 0 ? response.rows[0].value : 0
                }).catch(function() {})
            },
            select_program: function() {
                if (this.program == "SHOWALL") {
                    this.program = null
                }
                //TODO: improve this so it only starts off updating the active tab
                this.get_domains()
                this.get_ips()
                this.get_urls()
                this.get_services()
                this.get_stats()
            },
            listen_for_changes: function() {
                let vm = this
                this.db.changes({
                    since: 'now',
                    live: true,
                    include_docs: true
                }).on('change', function(change) {

                    var now = (new Date()).getTime()

                    // only refresh once in a while to avoid stalling
                    if (!vm.is_updating && (now - vm.last_refresh) > 5000) {

                        /*console.log(now)
                        console.log(vm.last_refresh)
                        console.log('Diff: ' + (now - vm.last_refresh))
                        console.log('Needs update: ' + (now - vm.last_refresh > 5000))
                        console.log('Is updating: ' + vm.is_updating)*/

                        vm.is_updating = true
                        vm.get_stats()

                        if ((change.doc.program == vm.program) || !vm.program) {
                            // it's a change to the program we're viewing (or we're viewing all programs)

                            if (change.doc.type == 'domain') {
                                vm.get_domains()
                            } else if (change.doc.type == 'ip') {
                                vm.get_ips()
                            } else if (change.doc.type == 'url') {
                                vm.get_urls()
                            } else if (change.doc.type == 'service') {
                                vm.get_services()
                            }

                        } else if (change.doc.type == 'service') {
                            vm.get_alerts()
                        }

                        vm.last_refresh = now
                        vm.is_updating = false
                    }

                }).on('error', function() {
                    // handle errors
                })
            },
            search_table: function() {
                return 1
            },
            load_records: function(type) {
                if (type == 'domains') {
                    this.get_domains(true)
                } else if (type == 'ips') {
                    this.get_ips(true)
                } else if (type == 'urls') {
                    this.get_urls(true)
                } else if (type == 'services') {
                    this.get_services(true)
                } else if (type == 'alerts') {
                    this.get_alerts(true)
                }
            },
            format_clipboard: function(table) {
                return table.map(
                    row => {
                        return row.id
                    }
                ).join("\n");
            }

        },
        watch: {
            'docstore.domains.filter_domains': function() {
                this.get_domains()
            },
            deep: true
        }
    }

</script>
