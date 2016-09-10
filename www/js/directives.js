angular.module('starter.directives', [])
// .directive('clickAnywhereButHere', ['$document', function ($document) {
//     return {
//         link: function postLink(scope, element, attrs) {
//             var onClick = function (event) {
//                 var isChild = $(element).has(event.target).length > 0;
//                 var isSelf = element[0] == event.target;
//                 var isInside = isChild || isSelf;
//                 if (!isInside) {
//                     scope.$apply(attrs.clickAnywhereButHere)
//                 }
//             }
//             scope.$watch(attrs.isActive, function(newValue, oldValue) {
//                 if (newValue !== oldValue && newValue == true) {
//                     $document.bind('click', onClick);
//                 }
//                 else if (newValue !== oldValue && newValue == false) {
//                     $document.unbind('click', onClick);
//                 }
//             });
//         }
//     };
// }]);