/*!
 * Copyright 2002 - 2018 Webdetails, a Hitachi Vantara company. All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

define([
  "cdf/lib/jquery",
  "amd!cdf/lib/underscore",
  "cdf/Dashboard.Clean"
], function($, _, Dashboard) {
  "use strict";

  /* globals beforeEach, describe, it, expect, spyOn */

  var unprocessedData = { data: 0 };
  var processedData = { data: [1, 2, 3] };
  var dashboard;

  describe("Xmla Queries", function() {
    beforeEach(function() {
      dashboard = new Dashboard();
    });

    function testXmlaDoQuery(type, name, queryOverrides) {
      spyOn(XMLHttpRequest.prototype, 'send').and.callFake(function() { /* noop */ });
      var xmlaQuery = dashboard.getQuery(type, {dataSource: name});

      var fakeXmlaDoQuery = _.bind(
        xmlaQuery.doQuery,
        // override some of the original methods to avoid having to mock XMLHttpRequests
        $.extend(true, xmlaQuery, queryOverrides)
      );

      fakeXmlaDoQuery(function(/* data */) { return processedData; });

      expect(xmlaQuery.getOption("lastResultSet")).toEqual(unprocessedData);
      expect(xmlaQuery.getOption("lastProcessedResultSet")).toEqual(processedData);
    }

    describe("XmlaQuery", function() {
      beforeEach(function() {
        dashboard.addDataSource("queryXMLA", {
          queryType: "xmla",
          catalog: "SteelWheels",
          query: function() {}
        });

        dashboard.init();
      });

      describe("#doQuery", function() {
        var queryOverrides = {
          _executeQuery: function(/* qd */) { return unprocessedData;},
          transformXMLAResults: function(/* results */) { return unprocessedData; }
        };

        it("should persist the last result and the post fetch processed result.", function() {
          testXmlaDoQuery("xmla", "queryXMLA", queryOverrides);
        });
      });
    });

    describe("XmlaDiscoverQuery", function() {
      beforeEach(function() {
        dashboard.addDataSource("queryXMLADiscover", {
          queryType: "xmlaDiscover",
          catalog: "SteelWheels",
          query: function() {}
        });

        dashboard.init();
      });

      describe("#doQuery", function() {
        var queryOverrides = {
          _executeDiscoverQuery: function(/* qd */) { return unprocessedData;},
          transformXMLADiscoverResults: function(/* results */) { return unprocessedData; }
        };

        it("should persist the last result and the post fetch processed result.", function() {
          testXmlaDoQuery("xmlaDiscover", "queryXMLADiscover", queryOverrides);
        });
      });
    });
  });
});
