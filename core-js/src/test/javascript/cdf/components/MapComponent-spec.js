/*!
 * Copyright 2002 - 2017 Webdetails, a Hitachi Vantara company. All rights reserved.
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
  "cdf/Dashboard.Clean",
  "cdf/components/MapComponent",
  "cdf/lib/jquery"
], function(Dashboard, MapComponent, $) {

  /**
   * ## The Map Component
   */
  describe("The Map Component #", function() {
    var dashboard;
    var mapComponent;

    beforeEach(function() {
      dashboard = new Dashboard();

      dashboard.addParameter("bottomThreshold", 1000000);
      dashboard.addParameter("topThreshold", 2000000);

      dashboard.init();

      mapComponent = new MapComponent({
        name: "mapComponent",
        type: "mapComponent",
        path: "/fake/GetPoints.xaction",
        parameters: [],
        listeners: [],
        messageElementId: "messages",
        htmlObject: "sampleObjectMap",
        executeAtStart: true,
        initPosLon: -7.5,
        initPosLat: 39.8,
        initZoom: 1,
        mapDiv: "myMap",
        expression: function() {
          return "var icon = '';" +
              "if (value < this.dashboard.getParameterValue('bottomThreshold')) {" +
              "  icon = markers[2];" +
              "} else if(value >= this.dashboard.getParameterValue('topThreshold')) {" +
              "  icon = markers[0];" +
              "} else {" +
              "  icon = markers[1]; " +
              "}; icon"; },
        preExecution: function() {},
        postExecution: function() {},
        markers: [["js/lib/OpenMap/OpenLayers/img/marker-green.png", 42, 50],
          "js/lib/OpenMap/OpenLayers/img/marker-gold.png",
          "js/lib/OpenMap/OpenLayers/img/marker.png"]
      });

      dashboard.addComponent(mapComponent);
    });

    /**
     * ## The Map Component # allows a dashboard to execute update
     */
    it("allows a dashboard to execute update", function(done) {
      spyOn(mapComponent, 'update').and.callThrough();
      spyOn($, "ajax").and.callFake(function() {
        return {responseXML: "<test/>"};
      });

      // listen to cdf:postExecution event
      mapComponent.once("cdf:postExecution", function() {
        expect(mapComponent.update).toHaveBeenCalled();
        done();
      });

      dashboard.update(mapComponent);
    });
  });
});
