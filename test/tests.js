
(function() {
    'use strict';

    var default_settings = {
        providers: [
            { alias: 'foo', cname: 'www.foo.com' },
            { alias: 'bar', cname: 'www.bar.com' },
            { alias: 'baz', cname: 'www.baz.com' },
            { alias: 'qux', cname: 'www.qux.com' }
        ],
        country_mapping: {
            'CN': [ 'foo', 'bar' ],
            'US': [ 'baz', 'qux' ]
        },
        asn_mapping: {
            '123': [ 'bar', 'qux' ],
            '234': [ 'bar', 'baz' ]
        },
        default_providers: [ 'foo', 'bar' ],
        last_resort_provider: 'foo',
        default_ttl: 20,
        normal_availability_threshold: 92,
        pingdom_availability_threshold: 50,
        sonar_threshold: 95,
        min_valid_rtt: 5
    };

    module('do_init');

    function test_do_init(i) {
        return function() {

            var sut,
                config = {
                    requireProvider: this.stub()
                },
                test_stuff = {
                    config: config
                };

            i.setup(test_stuff);

            sut = new OpenmixApplication(i.settings || default_settings);

            // Test
            sut.do_init(config);

            // Assert
            i.verify(test_stuff);
        };
    }

    test('change me', test_do_init({
        setup: function() {
            return;
        },
        verify: function(i) {
            equal(i.config.requireProvider.callCount, 4);
        }
    }));

    module('handle_request');

    function test_handle_request(i) {
        return function() {
            var sut,
                request = {
                    getProbe: this.stub(),
                    getData: this.stub()
                },
                response = {
                    respond: this.stub(),
                    setTTL: this.stub(),
                    setReasonCode: this.stub()
                },
                test_stuff = {
                    request: request,
                    response: response
                };

            i.setup(test_stuff);

            sut = new OpenmixApplication(i.settings || default_settings);

            // Test
            sut.handle_request(request, response);

            // Assert
            i.verify(test_stuff);
        };
    }

    test('use default providers', test_handle_request({
        avail: {
            foo: { avail: 100 },
            bar: { avail: 100 },
            baz: { avail: 100 },
            qux: { avail: 100 }
        },
        sonar: {
            foo: '0.999999',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: { http_rtt: 200 },
            bar: { http_rtt: 201 },
            baz: { http_rtt: 200 },
            qux: { http_rtt: 201 }
        },
        setup: function(i) {
            console.log(i);
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            console.log(i);
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'A');
            equal(i.response.setTTL.args[0][0], 20);
        }
    }));

    test('use ASN providers; qux fastest', test_handle_request({
        avail: {
            foo: { avail: 100 },
            bar: { avail: 100 },
            baz: { avail: 100 },
            qux: { avail: 100 }
        },
        sonar: {
            foo: '0.999999',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: { http_rtt: 200 },
            bar: { http_rtt: 201 },
            baz: { http_rtt: 200 },
            qux: { http_rtt: 200 }
        },
        setup: function(i) {
            console.log(i);
            i.request.asn = 123;
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            console.log(i);
            equal(i.response.respond.args[0][0], 'qux');
            equal(i.response.respond.args[0][1], 'www.qux.com');
        }
    }));

    test('1 available candidate based on Radar', test_handle_request({
        avail: {
            foo: { avail: 91.999999 },
            bar: { avail: 100 },
            baz: { avail: 100 },
            qux: { avail: 100 }
        },
        sonar: {
            foo: '1.000000',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: { http_rtt: 200 },
            bar: { http_rtt: 201 },
            baz: { http_rtt: 200 },
            qux: { http_rtt: 200 }
        },
        setup: function(i) {
            console.log(i);
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            console.log(i);
            equal(i.response.respond.args[0][0], 'bar');
            equal(i.response.respond.args[0][1], 'www.bar.com');
            equal(i.response.setReasonCode.args[0][0], 'D');
        }
    }));

    test('0 available candidates based on Radar', test_handle_request({
        avail: {
            foo: { avail: 91.999999 },
            bar: { avail: 91.999999 },
            baz: { avail: 100 },
            qux: { avail: 100 }
        },
        sonar: {
            foo: '1.000000',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: { http_rtt: 200 },
            bar: { http_rtt: 201 },
            baz: { http_rtt: 200 },
            qux: { http_rtt: 200 }
        },
        setup: function(i) {
            console.log(i);
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            console.log(i);
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'E');
        }
    }));

    test('no RTT data for available candidates', test_handle_request({
        avail: {
            foo: { avail: 100 },
            bar: { avail: 100 },
            baz: { avail: 100 },
            qux: { avail: 100 }
        },
        sonar: {
            foo: '1.000000',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: { http_rtt: 4 },
            bar: {},
            baz: {},
            qux: {}
        },
        setup: function(i) {
            console.log(i);
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            console.log(i);
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'F');
        }
    }));

}());
