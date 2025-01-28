<style>
.full-width {
    width: 98vw;
    position: relative;
    margin-left: -49vw;
    left: 50%;
}

.doc-link {
    text-decoration-line: underline;
    text-decoration-style: dotted;
    text-underline-offset: 0.2em;
    text-decoration-thickness: 1pt;
    cursor: pointer;
}
</style>
<template src="./main.html"></template>


<script>
import {
    BTabs,
    BTab,
    BTable,
    BPagination,
    BForm,
    BFormGroup,
    BFormRadio,
    BFormInput,
    BFormCheckbox,
    BNavbar,
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
        BForm,
        BFormGroup,
        BFormRadio,
        BFormInput,
        BFormCheckbox,
        BNavbar,
        BSpinner,
        BCollapse,
        BButton,
        BCard,
    },
    directives: {
        'b-toggle': VBToggle,
        'b-tooltip': VBTooltip,
    },
    data: function () {
        return {
            title: "BBRF dashboard",
            couchdb: localStorage.getItem('couchdb') ? localStorage.getItem('couchdb') : 'https://demo.bbrf.me/bbrf',
            couchdb_user: localStorage.getItem('couchdb-user') ? localStorage.getItem('couchdb-user') : 'bbrf',
            couchdb_pass: localStorage.getItem('couchdb-pass') ? localStorage.getItem('couchdb-pass') : 'bbrf',
            isLoading: true,
            isConnected: false,
            autoUpdate: true,
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
                    }
                }
            },
            docstore: {
                domains: {
                    filter_domains: 'all',
                    display_value: 'Domains',
                    records: [], // will be populated by PouchDB
                    tagnames: [],
                    table: {
                        isBusy: false,
                        fields: [{
                            key: 'id',
                            label: 'Domain',
                            sortable: true,
                            formatter: value => {
                                if (value.startsWith('._')) return value.substring(1)
                                return value
                            }
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
                    tagnames: [],
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
                    tagnames: [],
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
                    tagnames: [],
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
            active_tab: 'domains',
            settings: {
                parse_timestamps: {
                    description: 'Automatically parse UNIX timestamps',
                    info: 'Custom tags that look like UNIX timestamps will be automatically converted to a readable time format',
                    value: JSON.parse(localStorage.getItem('settings.parse_timestamps')) ?? true
                },
                full_width_table: {
                    description: 'Display data tables full page width',
                    info: 'Make the data table containing domains, IPs, URLs and services span the full width of the page',
                    value: JSON.parse(localStorage.getItem('settings.full_width_table')) ?? false
                }
            },
            showProgramDetails: false,
            docInfo: null,
            selectedDocument: null,
            requestIds: {
                domains: 0,
                ips: 0,
                urls: 0,
                services: 0,
                stats: 0
            },
            requestQueues: {
                domains: [],
                ips: [],
                urls: [],
                services: [],
                stats: []
            },
        }
    },
    computed: {

        fields_filtered() { // generalized attempt

            let vm = this
            
            return (docType) => {
                
                const documents = this.docstore[docType];

                // skip filtering if the tab is not currently active
                if(docType !== vm.active_tab) {
                    return vm.docstore[docType].records
                }

                let results = this.program
                    ? documents.table.fields.filter(field => field.key !== 'doc.program')
                    : documents.table.fields.slice();

                if (docType === 'domains' && documents.filter_domains === 'unresolved') {
                    results = results.filter(field => field.key !== 'doc.ips');
                }

                // Add custom tags if they are toggled on
                documents.tagnames.forEach(tag => {
                    if (tag.show) {
                        results.push({
                            key: `doc.tags.${tag.name}`,
                            label: tag.name,
                            sortable: true,
                            formatter: value => this.formatTagAsTimestamp(value)
                        });
                    }
                });

                return results;
            };
        },

       records_filtered: function () {
            // only return rows that match the filter value
            
            let vm = this

            return function (doctype) {

                // skip filtering if the tab is not currently active
                if(doctype !== vm.active_tab) {
                    return vm.docstore[doctype].records
                }

                // console.log("records_filtered called for " + doctype)
                // console.time('records_filtered_' + doctype);

                var documents = vm.docstore[doctype]
                var results = documents.records
                var filtered_fields = vm.fields_filtered(doctype)

                results = results.filter(function (row) {

                    var all_fields_match = true || row

                    // compare every column of the row to the filters
                    // var filtered_fields = vm.fields_filtered(doctype)
                    for (var i in filtered_fields) {
                        var field = filtered_fields[i].key
                        if (field in documents.table.filters && documents.table.filters[field].length > 0) {

                            var filter = documents.table.filters[field]
                            try {
                                // the try catch is necessary because the
                                // following eval will fail to get the data
                                // from rows without any custom tags when
                                // filtering on custom tags 
                                var value = eval('row.' + field)
                            } catch {
                                // do nothing
                            }

                            // fix #3: filter should be case insensitive
                            if (value && !value.toString().toLowerCase().includes(filter.toLowerCase())) {
                                all_fields_match = false
                            } else if (!value) {
                                all_fields_match = false
                            }
                            // there's a filter set, compare it to the row
                        }
                    }

                    return all_fields_match
                })
                // console.timeEnd('records_filtered_' + doctype);

                return results
            }
        },

        program_doc: function () {

            let vm = this
            var document = this.programs.filter(function (program) {
                if (program.id == vm.program) return true
            })[0]

            return document
        },

        highlightedProgramDetails: function () {
            return this.$highlight(JSON.stringify(this.program_doc.doc, null, 2));
        },

        connection_status: function () {
            if (this.programs.length > 0) return "connected"
            return "not connected"
        }
    },
    created: function () {
        this.initializeApp()
    },
    methods: {
        async initializeApp() {
            this.isLoading = true
            if (this.$route.params.tab) {
                this.active_tab = this.$route.params.tab
            }
            if (this.couchdb) {
                await this.connect_server()
                this.isConnected = true

                if (this.$route.params.program) {
                    this.program = this.$route.params.program
                    await this.select_program()
                }

            }
            this.isLoading = false
        },

       setRouterNavigation() {
            if (this.program == "SHOWALL") {
                this.program = null
                this.$router.push({ name: 'Home' })
            } else if (this.program) {
                if (this.$route.params.program !== this.program || this.$route.params.tab !== this.active_tab) {
                    this.$router.push({ name: 'ProgramTab', params: { program: this.program, tab: this.active_tab } })
                }
            }
        },

        async connect_server() {
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

                await Promise.all([
                    this.get_programs(),
                    this.get_stats(),
                    this.get_alerts()
                ])

                this.listen_for_changes()
            }
        },
        toggleProgramDetails() {
            this.showProgramDetails = !this.showProgramDetails;
        },
        fetchData: function (type, get_more = false) {
            let me = this
            const requestId = ++this.requestIds[type]

            const request = async () => {
                var options = {
                    reduce: false,
                    include_docs: true,
                    limit: this.page_size
                }

                if (get_more) {
                    options.skip = this.docstore[type].records.length
                } else {
                    this.docstore[type].records = []
                    this.docstore[type].table.isBusy = true
                }

                if (this.program) options.key = this.program

                let queryName = `bbrf/${type}`
                if (type === 'domains' && this.docstore.domains.filter_domains !== 'all') {
                    queryName += `_${this.docstore.domains.filter_domains}`
                } else if (type === 'urls') {
                    queryName = 'bbrf/urls_by_program'
                }

                try {
                    const response = await this.db.query(queryName, options)

                    // Check if this is still the most recent request
                    if (requestId === this.requestIds[type]) {
                        if (!get_more) {
                            me.docstore[type].records = []
                        }
                        for (var i = 0; i < response.rows.length; i++) {
                            me.docstore[type].records.push(response.rows[i])
                        }
                        me.docstore[type].table.isBusy = false
                    }
                } catch (error) {
                    console.error(`Error fetching ${type}:`, error)
                    me.docstore[type].table.isBusy = false
                }

                // Process next request in queue if any
                this.requestQueues[type].shift()
                if (this.requestQueues[type].length > 0) {
                    this.requestQueues[type][0]()
                }
            }

            // Add request to queue
            this.requestQueues[type].push(request)

            // If this is the only request, execute it immediately
            if (this.requestQueues[type].length === 1) {
                request()
            }
        },

        get_domains: function (get_more = false) {
            this.fetchData('domains', get_more)
        },

        get_ips: function (get_more = false) {
            this.fetchData('ips', get_more)
        },

        get_urls: function (get_more = false) {
            this.fetchData('urls', get_more)
        },

        get_services: function (get_more = false) {
            this.fetchData('services', get_more)
        },

        formatClickableDocuments(value) {
            if (!value) return '';
            const documents = Array.isArray(value) ? value : [value];
            if (documents.length === 0) return '(none)';
            return documents.map(doc => `<a v-b-tooltip title="Show document" href="#" class="doc-link">${doc}</a>`).join(', ');
        },

        handleDocumentClick(e) {
            let doc_id = e.target.innerHTML
            if (doc_id) {
                this.showJSONDocument(doc_id)
            }
        },

        showJSONDocument(doc_id) {
            // Implement the logic to fetch and display IP information in a popup
            this.selectedDocument = doc_id
            this.docInfo = null
            this.$bvModal.show('doc-info-modal')
            let me = this
            this.db.get(doc_id).then(function (response) {
                me.docInfo = me.$highlight(JSON.stringify(response, null, 2));
            }).catch(function () {
                console.log('Error fetching document')
                me.$bvModal.hide('doc-info-modal')
            })
        },

        get_tagnames: function (doctype) {
            let me = this

            this.docstore[doctype + 's'].tagnames = []

            var endpoint = 'bbrf/tagnames_by_program_doctype?key=["' + this.program + '","' + doctype + '"]'
            if (this.program == null)
                endpoint = 'bbrf/tagnames_by_doctype?key="' + doctype + '"'
            this.db.query(endpoint).then(function (response) {
                for (var i in response.rows) {
                    if (me.docstore[doctype + 's'].tagnames.map(x => x.name).indexOf(response.rows[i].value) == -1) {
                        me.docstore[doctype + 's'].tagnames.push({
                            name: response.rows[i].value,
                            show: false
                        })
                    }

                    // also add to filters, so we can use the table filter function
                    // note that this is never cleaned up, so the data structure
                    // might start aggregating loads of filters that don't actually
                    // belong to the currently active program
                    if (Object.keys(me.docstore[doctype + 's'].table.filters).indexOf(response.rows[i].value) == -1) {
                        // actually it turns out this is not needed (and not even working)
                        // because v-model automatically adds the field e.g. "doc.tags.protocol" (and not "protocol")
                        // when rendering the filter boxes
                        // me.docstore[doctype + 's'].table.filters[response.rows[i].value] = ''
                    }
                }

            }).catch(function () { })
        },
        get_programs: function () {
            let me = this
            this.programs = []

            var options = {
                reduce: false,
                include_docs: true
            }

            this.db.query('bbrf/programs', options).then(function (response) {
                for (var i = 0; i < response.rows.length; i++) {
                    if (response.rows[i]['value'] > 0 && !response.rows[i]['doc']['disabled'])
                        me.programs.push(response.rows[i])
                }
            }).catch(function () {

            })
        },
        get_alerts: function (get_more = false) {
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
            }

            this.db.query('bbrf/alerts', options).then(function (response) {
                for (var i = 0; i < response.rows.length; i++) {
                    me.alerts.records.push(response.rows[i])
                }
                me.alerts.table.isBusy = false
            }).catch(function () {

            })

        },
        get_stats: function () {
            let me = this
            const requestId = ++this.requestIds.stats

            const request = async () => {
                // Reset all counters
                for (var key in this.stats) {
                    this.stats[key] = 0;
                }

                var options = {
                    reduce: true
                }

                if (this.program) options.key = this.program

                try {
                    const [programs, domains, domainsResolved, domainsUnresolved, urls, ips, services] = await Promise.all([
                        this.db.query('bbrf/programs', { reduce: true }),
                        this.db.query('bbrf/domains', options),
                        this.db.query('bbrf/domains_resolved', options),
                        this.db.query('bbrf/domains_unresolved', options),
                        this.db.query('bbrf/urls_by_program', options),
                        this.db.query('bbrf/ips', options),
                        this.db.query('bbrf/services', options)
                    ]);

                    // Check if this is still the most recent request
                    if (requestId === this.requestIds.stats) {
                        me.stats.programs = programs.rows.length > 0 ? programs.rows[0].value : 0
                        me.stats.domains = domains.rows.length > 0 ? domains.rows[0].value : 0
                        me.stats.domains_resolved = domainsResolved.rows.length > 0 ? domainsResolved.rows[0].value : 0
                        me.stats.domains_unresolved = domainsUnresolved.rows.length > 0 ? domainsUnresolved.rows[0].value : 0
                        me.stats.urls = urls.rows.length > 0 ? urls.rows[0].value : 0
                        me.stats.ips = ips.rows.length > 0 ? ips.rows[0].value : 0
                        me.stats.services = services.rows.length > 0 ? services.rows[0].value : 0
                    }
                } catch (error) {
                    console.error('Error fetching stats:', error)
                }

                // Process next request in queue if any
                this.requestQueues.stats.shift()
                if (this.requestQueues.stats.length > 0) {
                    this.requestQueues.stats[0]()
                }
            }

            // Add request to queue
            this.requestQueues.stats.push(request)

            // If this is the only request, execute it immediately
            if (this.requestQueues.stats.length === 1) {
                request()
            }
        },
        async select_program() {
            this.setRouterNavigation()
            await Promise.all([
                this.get_domains(),
                this.get_tagnames('domain'),
                this.get_ips(),
                this.get_tagnames('ip'),
                this.get_urls(),
                this.get_tagnames('url'),
                this.get_services(),
                this.get_tagnames('service'),
                this.get_stats()
            ]);
        },
        listen_for_changes: function () {
            let vm = this
            this.db.changes({
                since: 'now',
                live: true,
                include_docs: true
            }).on('change', function (change) {

                var now = (new Date()).getTime()

                // only refresh once in a while to avoid stalling
                if (vm.autoUpdate && !vm.is_updating && (now - vm.last_refresh) > 5000) {

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

            }).on('error', function () {
                // handle errors
            })
        },
        load_more_records: function (type) {
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
        format_clipboard: function (table) {
            return table.map(
                row => {
                    return row.id
                }
            ).join("\n");
        },
        handle_computed_call: function (function_name) {
            return this[function_name]
        },
        formatTagAsTimestamp: function (value) {
            if (this.settings.parse_timestamps.value && parseInt(value) + '' === value && value.length == 10) {
                var parsed = this.$moment(parseInt(value) * 1000).fromNow();
                if (parsed !== 'Invalid date')
                    return parsed;
            }
            return value;
        },
        save_settings: function () {
            for (var setting in this.settings) {
                localStorage.setItem('settings.' + setting, this.settings[setting].value)
            }
        }
    },
    watch: {
        async $route(to, from) {
            if (to.params.tab !== from.params.tab) {
                this.active_tab = to.params.tab
            }
            if (this.isConnected) {
                if (to.params.program !== from.params.program) {
                    this.program = to.params.program || null
                    await this.select_program()
                }
            }
        },
        active_tab() {
            this.setRouterNavigation()
        },
        'docstore.domains.filter_domains': function () {
            this.get_domains()
        },
        deep: true
    }
}

</script>
