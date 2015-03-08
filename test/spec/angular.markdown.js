'use strict';

describe('Module: angular.markdown', function () {
  var scope, $sandbox, $compile, $timeout;

  // load the controller's module
  beforeEach(module('angular.markdown'));

  beforeEach(inject(function ($injector, $rootScope, _$compile_, _$timeout_) {
    scope = $rootScope;
    $compile = _$compile_;
    $timeout = _$timeout_;

    $sandbox = $('<div id="sandbox"></div>').appendTo($('body'));
  }));

  afterEach(function() {
    $sandbox.remove();
    scope.$destroy();
  });

  var templates = {
    'default': {
      scope: {
        content: '#hello world'
      },
      element: '<div markdown="content"></div>'
    }
  };

  function compileDirective(template) {
    template = template ? templates[template] : templates['default'];
    angular.extend(scope, template.scope || templates['default'].scope);
    var $element = $(template.element).appendTo($sandbox);
    $element = $compile($element)(scope);
    scope.$digest();
    return $element;
  }

  it('should correctly display hello world', function () {
    var elm = compileDirective();
    expect(elm.html().replace(/\s*$/,'')).toBe('<h1>hello world</h1>');
  });

});
