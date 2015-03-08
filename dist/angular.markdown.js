'use strict';
angular.module('angular.markdown', ['ngSanitize']).run([
  '$templateCache',
  function ($templateCache) {
    $templateCache.put('editor.template.html', '<div class="editor-container"><div ng-show="editor.isPreview" markdown="content" class="editor-content"></div><textarea ng-style="{\'height\':editor.rownums*20+14+\'px\'}" ng-hide="editor.isPreview" ng-model="content" name="editorContent" required ng-minlength="{{min}}" ng-maxlength="{{max}}"></textarea><div class="editor-toolbar"><ul class="pull-left"><li><a href="http://wowubuntu.com/markdown/" target="_blank"><i class="fa fa-question-circle fa-btn" title="\u67e5\u770bmarkdown\u8bed\u6cd5"></i></a></li><li action="preview"><i class="fa fa-btn" title="\u9884\u89c8/\u53d6\u6d88\u9884\u89c8" ng-class="{\'fa-eye\': !editor.isPreview, \'fa-eye-slash\': editor.isPreview}"></i></li><li action="insertImg"><i class="fa fa-photo fa-btn" title="\u63d2\u5165\u56fe\u7247" ng-hide="editor.isPreview"></i></li><li action="insertLink"><i class="fa fa-link fa-btn" title="\u63d2\u5165\u94fe\u63a5" ng-hide="editor.isPreview"></i></li><li action="insertCode"><i class="fa fa-code fa-btn" title="\u63d2\u5165\u4ee3\u7801" ng-hide="editor.isPreview"></i></li></ul><button class="pull-right editor-submit btn" ng-if="needSubmit()" ng-click="submit()" ng-disabled="cannotSubmit()">\u8bc4\u8bba\u4e00\u4e0b</button></div></div>');
  }
]).factory('mdParser', [
  '$sanitize',
  '$window',
  function ($sanitize, $window) {
    var renderer = new marked.Renderer();
    renderer.code = function (code, lang, escaped) {
      if (this.options.highlight) {
        var out = this.options.highlight(code, lang);
        if (out !== null && out !== code) {
          escaped = true;
          code = out;
        }
      }
      var clazz = 'hljs ' + (lang && this.options.langPrefix + $window.escape(lang, true) || '');
      return '<pre><code class="' + clazz + '">' + (escaped ? code : $window.escape(code, true)) + '</code></pre>';
    };
    marked.setOptions({
      highlight: function (code) {
        return $window.hljs && $window.hljs.highlightAuto(code).value;
      },
      renderer: renderer
    });
    return {
      parse: function (text) {
        text = text || '';
        return $sanitize(marked(text));
      }
    };
  }
]).directive('markdown', [
  'mdParser',
  function (mdParser) {
    return function (scope, element, attr) {
      if (attr.markdown) {
        scope.$watch(attr.markdown, function (value) {
          var html = mdParser.parse(value);
          element.html(html);
        });
      } else {
        element.html(mdParser.parse(element.text()));
      }
    };
  }
]).directive('mdEditor', [
  'mdParser',
  '$window',
  function (mdParser, $window) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'editor.template.html',
      scope: {
        content: '=mdEditorModel',
        settting: '@mdEditorSettting',
        submit: '&mdEditorSubmit',
        min: '@mdEditorMinlength',
        max: '@mdEditorMaxlength',
        formname: '@mdEditorFormname'
      },
      link: function (scope, element, attrs, controller) {
        var editor = {};
        editor.isFullScreen = false;
        editor.isPreview = false;
        editor.rownums = 3;
        scope.editor = editor;
        var rangeText = scope.range || '';
        rangeText = rangeText.split(',');
        scope.range = {};
        scope.range.min = +rangeText[0] || 1;
        scope.range.min = +rangeText[1] || 1000;
        scope.needSubmit = function () {
          return angular.isFunction(scope.submit);
        };
        scope.cannotSubmit = function () {
          return !scope.$parent[scope.formname] || scope.$parent[scope.formname].$invalid;
        };
        var textarea = element.find('textarea');
        textarea.bind('keyup', function (e) {
          if (e.which === 13 || e.which === 8 || e.ctrlKey && (e.which === 86 || e.which === 88)) {
            actions.calcRownum();
          }
        });
        textarea = textarea[0];
        var actions = {
            calcRownum: function () {
              var rownums = textarea.value.split('\n').length + 1;
              if (rownums < 3)
                rownums = 3;
              if (rownums !== editor.rownums) {
                scope.$apply(function () {
                  editor.rownums = rownums;
                });
              }
            },
            beFocus: function () {
              $window.setTimeout(function () {
                textarea.focus();
              }, 100);
            },
            preview: function (elem) {
              var $this = this;
              scope.$apply(function () {
                editor.isPreview = !editor.isPreview;
                if (!editor.isPreview) {
                  $this.beFocus();
                }
              });
            },
            insertImg: function () {
              var url = $window.prompt('\u8bf7\u8f93\u5165\u56fe\u7247\u7684\u5730\u5740'), start, text;
              if (url) {
                start = this.getCursorIndex();
                text = '![\u56fe\u7247\u63cf\u8ff0](' + url + ')';
                this.insertContent(text);
                this.setSelection(start + 2, start + 6);
              }
            },
            insertLink: function () {
              var url = $window.prompt('\u8bf7\u8f93\u5165\u94fe\u63a5\u7684\u5730\u5740'), start, text;
              if (url) {
                start = this.getCursorIndex();
                text = '[\u8fde\u63a5\u540d\u79f0](' + url + ')';
                this.insertContent(text);
                this.setSelection(start + 1, start + 5);
              }
            },
            insertCode: function () {
              var text = this.getSelection(), start, end;
              if (text) {
                text = '\n```\n' + text + '\n```';
              } else {
                text = '\n```\n\n```';
              }
              start = this.getCursorIndex() + 5;
              end = start + text.length - 9;
              if (start === 5) {
                text = text.substring(1);
                start--;
                end--;
              }
              this.insertContent(text);
              this.setSelection(start, end);
              this.beFocus();
              this.calcRownum();
            },
            getSelection: function () {
              var start = textarea.selectionStart, end = textarea.selectionEnd;
              return textarea.value.substring(start, end);
            },
            getCursorIndex: function () {
              return textarea.selectionStart;
            },
            getContent: function () {
              return textarea.value;
            },
            insertContent: function (content, start, end) {
              if (isNaN(start) || isNaN(end)) {
                start = textarea.selectionStart;
                end = textarea.selectionEnd;
              }
              var value = textarea.value;
              value = value.substring(0, start) + content + value.substring(end);
              textarea.value = value;
            },
            setSelection: function (start, end) {
              end = end || start;
              textarea.selectionStart = start;
              textarea.selectionEnd = end;
            }
          };
        element.children().children().eq(-1).bind('click', function (e) {
          var target = e.target;
          if (target.tagName === 'I')
            target = target.parentNode;
          var action = actions[target.getAttribute('action')];
          if (angular.isFunction(action)) {
            action.call(actions, target);
          }
        });
        element.children().eq(0).bind('click', function (e) {
          actions.preview();
        });
      }
    };
  }
]);