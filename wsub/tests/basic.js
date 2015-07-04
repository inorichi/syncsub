// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

describe("Basic angular tests", function() {

  beforeEach(function() {
    angular.mock.module('subs');
  });

  it("should contains the app", function() {
    expect(angular.module('subs')).toBeDefined();
  });

  it("should contains basic services", inject(function(LineService, StyleService, VideoService, DataService) {
    expect(LineService).toBeDefined();
    expect(StyleService).toBeDefined();
    expect(VideoService).toBeDefined();
    expect(DataService).toBeDefined();
  }));

  it("should have right names", inject(function(LineService, StyleService) {
    expect(LineService.name).toBe('line');
    expect(StyleService.name).toBe('style');
  }));



});
