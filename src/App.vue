<template>
    <div id="app">
        <nav class="navbar navbar-dark bg-dark">
            <form>
                <div class="form-row align-items-center">
                    <div class="col-auto">
                        <label class="sr-only" for="inlineFormInputGroup">Username</label>
                        <div class="input-group mb-2">
                            <div class="input-group-prepend">
                                <div class="input-group-text">BBRF server:</div>
                            </div>
                            <input type="text" size="100" class="form-control" id="inlineFormInputGroup" placeholder="http://localhost:5984/bbrf" v-model="couchdb">
                        </div>
                    </div>
                    <div class="col-auto">
                        <button type="submit" class="btn btn-primary mb-2" @click.prevent="connectServer">Connect</button>
                    </div>
                </div>
            </form>
        </nav>
        <div class="container">
            <p><br /></p>
            <div class="row">
                <div class="col-sm-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">{{ stats.program_count.toLocaleString() }}</h5>
                            <p class="card-text">Programs</p>
                        </div>
                    </div>
                </div>
                <div class="col-sm-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">{{ stats.domain_count.toLocaleString() }}</h5>
                            <p class="card-text">Domains</p>
                        </div>
                    </div>
                </div>
                <div class="col-sm-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">{{ stats.ip_count.toLocaleString() }}</h5>
                            <p class="card-text">IPs</p>
                        </div>
                    </div>
                </div>
                <div class="col-sm-3">
                    <div class="card">
                        <div class="card-body text-center">
                            <h5 class="card-title">{{ stats.url_count.toLocaleString() }}</h5>
                            <p class="card-text">URLs</p>
                        </div>
                    </div>
                </div>
            </div>
            <p><br /></p>
            <h4>Programs</h4>
            <div class="form-group">
                <label for="programSelect">Select a program below to load data tables.</label>
                <select @change="select_program" v-model="program" class="form-control" id="programSelect">
                    <option value="SHOWALL">Show all programs - this may be very heavy on your browser!</option>
                    <option v-for="program in programs" v-bind:key="program.id">{{ program.id }}</option>
                </select>
            </div>

            <div>
                <b-tabs>
                    <b-tab v-for="(docs, doctype) in docstore" :key="doctype" :title="docs.display_value">
                        <b-table show-empty striped bordered :items="docs.records" :fields="docs.table.fields" :options="docs.table.options" />
                    </b-tab>
                </b-tabs>
            </div>

        </div>
        <footer class="footer">
            <div class="container" id="footer">
                <center>
                    <hr />
                    <p class="small">Created with &hearts; by <a href="https://twitter.com/honoki">@honoki</a></p>
                </center>
            </div>
        </footer>
    </div>

</template>

<script>
    import {
        BTabs,
        BTab,
        BTable
    } from 'bootstrap-vue'

    import PouchDB from 'pouchdb'
    import 'bootstrap/dist/css/bootstrap.css'
    import 'bootstrap-vue/dist/bootstrap-vue.css'

    export default {
        name: 'App',
        components: {
            BTable,
            BTabs,
            BTab
        },
        data: function() {
            return {
                title: "BBRF dashboard",
                couchdb: localStorage.getItem('couchdb'),
                program: null,
                stats: {
                    program_count: 0,
                    domain_count: 0,
                    domain_resolved_count: 0,
                    ip_count: 0,
                    url_count: 0
                },
                programs: [],
                alerts: [],
                docstore: {
                    domains: {
                        display_value: 'Domains',
                        records: [], // will be populated by PouchDB
                        table: {
                            fields: [{
                                    key: 'id',
                                    label: 'Domain',
                                    sortable: true
                                },
                                {
                                    key: 'doc.program',
                                    label: 'Program',
                                    sortable: false
                                },
                                {
                                    key: 'doc.source',
                                    label: 'Source',
                                    sortable: true
                                }
                            ],
                        }
                    },
                    ips: {
                        display_value: 'IPs',
                        records: [], // will be populated by PouchDB
                        table: {
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
                                    key: 'doc.program',
                                    label: 'Program',
                                    sortable: false
                                },
                                {
                                    key: 'doc.source',
                                    label: 'Source',
                                    sortable: true
                                }
                            ]

                        }
                    },
                    urls: {
                        display_value: 'URLs',
                        records: [], // will be populated by PouchDB
                        table: {
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
                                    key: 'doc.program',
                                    label: 'Program',
                                    sortable: false
                                },
                                {
                                    key: 'doc.source',
                                    label: 'Source',
                                    sortable: true
                                }
                            ]

                        }
                    }
                },
            }
        },
        created: function() {
            if (this.couchdb) this.connectServer()
        },
        methods: {
            connectServer: function() {
                if (this.couchdb) {
                    this.db = new PouchDB(this.couchdb)
                    localStorage.setItem('couchdb', this.couchdb)

                    this.get_programs()
                    this.get_stats()
                    this.listen_for_changes()
                }
            },
            get_domains: function() {

                this.docstore.domains.records = []
                let me = this

                var options = {
                    reduce: false,
                    include_docs: true
                }

                if (this.program) options.key = this.program

                this.db.query('bbrf/domains', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.docstore.domains.records.push(response.rows[i])
                    }
                }).catch(function() {

                })
            },
            get_ips: function() {

                this.docstore.ips.records = []
                let me = this

                var options = {
                    reduce: false,
                    include_docs: true
                }

                if (this.program) options.key = this.program

                this.db.query('bbrf/ips', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.docstore.ips.records.push(response.rows[i])
                    }
                }).catch(function() {

                })
            },
            get_urls: function() {
                let me = this
                this.docstore.urls.records = []

                var options = {
                    reduce: false,
                    include_docs: true
                }

                if (this.program) options.key = this.program

                this.db.query('bbrf/urls_by_program', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.docstore.urls.records.push(response.rows[i])
                    }
                }).catch(function() {

                })
            },
            get_programs: function() {
                let me = this
                this.programs = []

                var options = {
                    reduce: false,
                    include_docs: false
                }

                this.db.query('bbrf/programs', options).then(function(response) {
                    for (var i = 0; i < response.rows.length; i++) {
                        me.programs.push(response.rows[i])
                    }
                }).catch(function() {

                })
            },
            get_stats: function() {
                let me = this

                // reset all counters
                for (var i = 0; i < this.stats.length; i++) {
                    this.stats[i] = 0;
                }

                this.db.query('bbrf/programs', {
                    reduce: true
                }).then(function(response) {
                    me.stats.program_count = response.rows[0].value
                }).catch(function() {})
                this.db.query('bbrf/domains', {
                    reduce: true
                }).then(function(response) {
                    me.stats.domain_count = response.rows[0].value
                }).catch(function() {})
                this.db.query('bbrf/domains_resolved', {
                    reduce: true
                }).then(function(response) {
                    me.stats.domain_resolved_count = response.rows[0].value
                }).catch(function() {})
                this.db.query('bbrf/urls_by_hostname', {
                    reduce: true
                }).then(function(response) {
                    me.stats.url_count = response.rows[0].value
                }).catch(function() {})
                this.db.query('bbrf/ips', {
                    reduce: true
                }).then(function(response) {
                    me.stats.ip_count = response.rows[0].value
                }).catch(function() {})
            },
            select_program: function() {
                if (this.program == "SHOWALL") this.program = null
                this.get_domains()
                this.get_ips()
                this.get_urls()
            },
            listen_for_changes: function() {
                let vm = this
                this.db.changes({
                    since: 'now',
                    live: true,
                    include_docs: true
                }).on('change', function(change) {
                    
                    vm.get_stats()
                    
                    if((change.doc.program == this.program) || !this.program) {
                        // it's a change to the program we're viewing (or we're viewing all programs)
                        
                        if(change.doc.type == 'domain') {
                            vm.get_domains()
                        } else if(change.doc.type == 'ip') {
                            vm.get_ips()
                        } else if(change.doc.type == 'url') {
                            vm.get_urls()
                        }
                        
                    }
                    console.log(change)
                }).on('error', function(err) {
                    // handle errors
                    console.log(err)
                })
            }

        }
    }
</script>

<style>
    #app {}
</style>