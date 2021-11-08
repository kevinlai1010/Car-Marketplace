(function () {
    'use strict';

    var _templateBase = './scripts';

    angular.module('app', [
        'ngRoute',
        'ngMaterial',
        'ngAnimate',
        'md.data.table',
        'ngMdIcons'
    ])
        .config(['$routeProvider', '$mdIconProvider', '$compileProvider', '$mdDateLocaleProvider', function ($routeProvider, $mdIconProvider, $compileProvider, $mdDateLocaleProvider) {
            $routeProvider.when('/', {
                templateUrl: _templateBase + '/trading/trading.html',
                controller: 'tradingController',
            });
            $routeProvider.otherwise({redirectTo: '/'});
            $mdIconProvider
                .icon('communication', './assets/img/svg/ic_delete_black_24px.svg', 24);
            $compileProvider.preAssignBindingsEnabled(true);
            $mdDateLocaleProvider.formatDate = function (date) {
                if(date ==undefined)
                    return "";
                var day = date.getDate();
                var monthIndex = date.getMonth();
                var year = date.getFullYear();

                return day + '/' + (monthIndex + 1) + '/' + year;
            };
        }
        ]);

})();