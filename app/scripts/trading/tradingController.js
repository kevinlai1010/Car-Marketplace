(function () {
    'use strict';
    angular.module('app')
        .controller('tradingController', ['tradingService', '$q', '$mdDialog','$scope', TradingController]);

    function TradingController(tradingService, $q, $mdDialog, $scope) {
        var self = $scope;
        $scope.logItem = function (item) {
            console.log(item, 'was selected');
            if(item.sellDate != undefined){
                item.sellDate = new Date(item.sellDate);
            }
            if(item.buyDate != undefined){
                item.buyDate = new Date(item.buyDate);
            }
            self.newEntry = item;
        };
        $scope.itemSelected = []
        $scope.selected = [];
        $scope.limitOptions = [10, 15, 20];

        $scope.options = {
            rowSelection: true,
            multiSelect: false,
            autoSelect: false,
            decapitate: false,
            largeEditDialog: false,
            boundaryLinks: false,
            limitSelect: true,
            pageSelect: true
        };

        $scope.query = {
            order: 'name',
            limit: 5,
            page: 1
        };
        emptyNewEntry();
        self.selected = [];
        self.tradings = [];
        self.selectedIndex = 0;
        self.filterText = null;
        self.selectTrading = selectTrading;
        self.deleteTrading = deleteTrading;
        self.saveTrading = saveTrading;
        self.createTrading = createTrading;
        self.filter = filterTrading;
        self.emptyNewEntry = emptyNewEntry;
        self.onDelete = function($event) {
            console.log($event, "delete");
        };
        console.log("controller initialized");
        // Load initial data
        getAllTradings();
        self.query = {
            order: 'name',
            limit: 10,
            page: 1
        };
        //----------------------
        // Internal functions 
        //----------------------

        function selectTrading(trading, index) {
            self.selected = angular.isNumber(trading) ? self.tradings[trading] : trading;
            self.selectedIndex = angular.isNumber(trading) ? trading : index;
        }

        function deleteTrading($event) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .content('Are you sure want to delete this trading?')
                .ok('Yes')
                .cancel('No')
                .targetEvent($event);


            $mdDialog.show(confirm).then(function () {
                tradingService.destroy(self.selected.trading_id).then(function (affectedRows) {
                    self.tradings.splice(self.selectedIndex, 1);
                });
            }, function () {
            });
        }

        function saveTrading($event) {
            console.log(self.newEntry);
            var e = $event;
            if (self.selected != null && self.selected.trading_id != null) {
                tradingService.update(self.selected).then(function (affectedRows) {
                    $mdDialog.show(
                        $mdDialog
                            .alert()
                            .clickOutsideToClose(true)
                            .title('Success')
                            .content('Data Updated Successfully!')
                            .ok('Ok')
                            .targetEvent(e)
                    );
                });
            }
            else {
                //self.selected.trading_id = new Date().getSeconds();
                if (!isValid()) {
                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title('Erreur de validation')
                            .content('Des informations sont manquantes')
                            .ok('Ok')
                            .targetEvent(e)
                    );
                } else {
                    tradingService.create(self.newEntry).then(function (affectedRows) {
                        console.log(affectedRows);
                        //self.tradings.push(self.selected);
                        getAllTradings();
                        $mdDialog.show(
                            $mdDialog
                                .alert()
                                .clickOutsideToClose(true)
                                .title('Success')
                                .content('Data Added Successfully!')
                                .ok('Ok')
                                .targetEvent(e)
                        );
                    });
                }
            }
        }

        function isValid() {
            if (self.newEntry == undefined || self.newEntry.make == "" || self.newEntry.vin == "") {
                return false;
            } else {
                return true;
            }

        }

        function createTrading() {
            self.selected = {};
            self.selectedIndex = null;
        }

        function getAllTradings() {
            tradingService.getTradings().then(function (tradings) {
                self.tradings = [].concat(tradings);
            });
        }

        function filterTrading() {
            if (self.filterText == null || self.filterText == "") {
                getAllTradings();
            }
            else {
                tradingService.getByName(self.filterText).then(function (tradings) {
                    self.tradings = [].concat(tradings);
                    self.selected = tradings[0];
                });
            }
        }

        function emptyNewEntry() {
            self.newEntry = {};
            self.newEntry.make = "";
            self.newEntry.vin = "";
            self.newEntry.seller = "";
            self.newEntry.buyDate = new Date();
            self.newEntry.selled = "non";

            self.newEntry.buyer = "";
            self.newEntry.sellDate = new Date();
            self.newEntry.remarks = "";
        }
    }

})();