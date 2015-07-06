
(function() {
    'use strict';

    var defaultSettings = {
        providers: {
            'foo': 'www.foo.com',
            'bar': 'www.bar.com',
            'baz': 'www.baz.com',
            'qux': 'www.qux.com'
        },
        countryMapping: {
            'CN': [ 'foo', 'bar' ],
            'US': [ 'baz', 'qux' ]
        },
        asnMapping: {
            '123': [ 'bar', 'qux' ],
            '234': [ 'bar', 'baz' ]
        },
        defaultProviders: [ 'foo', 'bar' ],
        lastResortProvider: 'foo',
        defaultTtl: 20,
        availabilityThresholds: {
            normal: 92,
            pingdom: 50
        },
        sonarThreshold: 0.95,
        minValidRtt: 5
    };

    module('doInit');

    function testDoInit(i) {
        return function() {

            var sut,
                config = {
                    requireProvider: this.stub()
                },
                testStuff = {
                    config: config
                };

            i.setup(testStuff);

            sut = new OpenmixApplication(i.settings || defaultSettings);

            // Test
            sut.doInit(config);

            // Assert
            i.verify(testStuff);
        };
    }

    test('default', testDoInit({
        setup: function() {
            return;
        },
        verify: function(i) {
            equal(i.config.requireProvider.callCount, 4, 'Check requireProvider call count');
            equal(i.config.requireProvider.args[3][0], 'foo', 'Check provider alias');
            equal(i.config.requireProvider.args[2][0], 'bar', 'Check provider alias');
            equal(i.config.requireProvider.args[1][0], 'baz', 'Check provider alias');
            equal(i.config.requireProvider.args[0][0], 'qux', 'Check provider alias');
        }
    }));

    module('handleRequest');

    function testHandleRequest(i) {
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
                testStuff = {
                    request: request,
                    response: response
                };

            i.setup(testStuff);

            sut = new OpenmixApplication(i.settings || defaultSettings);

            // Test
            sut.handleRequest(request, response);

            // Assert
            i.verify(testStuff);
        };
    }

    test('use country providers; baz fastest of those', testHandleRequest({
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
            foo: { 'http_rtt': 100 },
            bar: { 'http_rtt': 201 },
            baz: { 'http_rtt': 199 },
            qux: { 'http_rtt': 200 }
        },
        setup: function(i) {
            i.request.country = 'US';
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            equal(i.response.respond.args[0][0], 'baz');
            equal(i.response.respond.args[0][1], 'www.baz.com');
            equal(i.response.setTTL.args[0][0], 20);
        }
    }));

    test('on bar available', testHandleRequest({
        avail: {
            foo: { avail: 91 },
            bar: { avail: 100 },
            baz: { avail: 91 },
            qux: { avail: 91 }
        },
        sonar: {
            foo: '1.000000',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: { 'http_rtt': 200 },
            bar: { 'http_rtt': 201 },
            baz: { 'http_rtt': 200 },
            qux: { 'http_rtt': 200 }
        },
        setup: function(i) {
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            equal(i.response.respond.args[0][0], 'bar');
            equal(i.response.respond.args[0][1], 'www.bar.com');
            equal(i.response.setReasonCode.args[0][0], 'D');
            equal(i.response.setTTL.args[0][0], 20);
        }
    }));

    test('no available candidates', testHandleRequest({
        avail: {
            foo: { avail: 91 },
            bar: { avail: 91 },
            baz: { avail: 91 },
            qux: { avail: 91 }
        },
        sonar: {
            foo: '1.000000',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: { 'http_rtt': 200 },
            bar: { 'http_rtt': 201 },
            baz: { 'http_rtt': 200 },
            qux: { 'http_rtt': 200 }
        },
        setup: function(i) {
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'E');
            equal(i.response.setTTL.args[0][0], 20);
        }
    }));

    test('RTT data for only 1 available candidate', testHandleRequest({
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
            foo: { 'http_rtt': 4 },
            bar: {},
            baz: {},
            qux: {}
        },
        setup: function(i) {
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'D');
            equal(i.response.setTTL.args[0][0], 20);
        }
    }));

    test('RTT data for no available candidates', testHandleRequest({
        avail: {
            foo: { avail: 91 },
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
            foo: { 'http_rtt': 4 },
            bar: {},
            baz: {},
            qux: {}
        },
        setup: function(i) {
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'E');
            equal(i.response.setTTL.args[0][0], 20);
        }
    }));

    test('no data', testHandleRequest({
        avail: {
            foo: {},
            bar: {},
            baz: {},
            qux: {}
        },
        sonar: {
            foo: '1.000000',
            bar: '1.000000',
            baz: '1.000000',
            qux: '1.000000'
        },
        rtt: {
            foo: {},
            bar: {},
            baz: {},
            qux: {}
        },
        setup: function(i) {
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'E');
        }
    }));

    test('no mappings', testHandleRequest({
        settings: {
            providers: {
                'foo': 'www.foo.com',
                'bar': 'www.bar.com',
                'baz': 'www.baz.com',
            },
            defaultProviders: [ 'foo', 'bar' ],
            lastResortProvider: 'foo',
            defaultTtl: 20,
            availabilityThresholds: {
                normal: 92,
                pingdom: 50
            },
            sonarThreshold: 0.95,
            minValidRtt: 5
        },
        avail: {
            foo: { avail: 100 },
            bar: { avail: 100 },
            baz: { avail: 100 }
        },
        sonar: {
            foo: '1.000000',
            bar: '1.000000',
            baz: '1.000000'
        },
        rtt: {
            foo: { 'http_rtt': 199 },
            bar: { 'http_rtt': 200 },
            baz: { 'http_rtt': 200 }
        },
        setup: function(i) {
            i.request.getProbe.withArgs('avail').returns(this.avail);
            i.request.getProbe.withArgs('http_rtt').returns(this.rtt);
            i.request.getData.returns(this.sonar);
        },
        verify: function(i) {
            equal(i.response.respond.args[0][0], 'foo');
            equal(i.response.respond.args[0][1], 'www.foo.com');
            equal(i.response.setReasonCode.args[0][0], 'A');
        }
    }));

}());
