var deployStackControllers = angular.module('deployStackControllers', ['mm.foundation']);

deployStackControllers.factory('alarmService', function() {
  return {
    sharedAlarm: { alerts: [] },
  };
});

deployStackControllers.factory('networkService', function() {
  var netData = {
    public_net: "2e2bc7f9-c29c-467c-94b6-5ef3724d79ac",
    private_net: "fd704f1b-9238-4c2c-a0f5-4ffb4543e33a",
    private_subnet: "ab4595bf-12d5-4e92-baa8-b5dfb3c1a31d"
  };

  function set(net) {
    netData = net;
  };

  function get() {
    return netData;
  };

  return {
    set: set,
    get: get
  };

});


deployStackControllers.controller('StackNewCtrl', function ($scope, $http, $location, alarmService, networkService) {
  // Create empty objects so they can be filled with options and parameters
  $scope.cloudData = {};
  $scope.cloudData.networks = {};
  $scope.cloudData.connector = {};
  $scope.cloudData.broker = {};
  $scope.cloudData.media_server_group = {};
  $scope.cloudData.media_server_group.policies = [];
  $scope.policiesData = {};
  $scope.alerts = alarmService.sharedAlarm.alerts;
  $scope.closeAlert = alarmService.closeAlert;
  $scope.ip = $location.host();
  $scope.path = 'http://' + $scope.ip + ':8080/stacks';
  $scope.stackStatus = null;

  // Push all data into submission variable with organization name prefix
  $scope.formData = {};
  $scope.formData.organization = $scope.cloudData;

  // Dropdown menu options and set defaults
  $scope.flavors = [
      "m1.small", "m1.medium", "m1.large"
  ];
  $scope.cloudData.connector.flavor = $scope.flavors[1];
  $scope.cloudData.broker.flavor = $scope.flavors[1];
  $scope.cloudData.media_server_group.flavor = $scope.flavors[1];

  $scope.capacities = [
      "1", "2", "3", "4"
  ];
  $scope.cloudData.media_server_group.min_size = $scope.capacities[0];
  $scope.cloudData.media_server_group.max_size = $scope.capacities[2];

  $scope.policiesLabels = [
    "Name", "Meter", "Statistic", "Comparison", "Threshold", "Period", "Adjustment type", "Scaling adjustment", "Cooldown", ""
  ];

  $scope.policiesCount = [];

  $scope.alarmsMeter = [
    "cpu", "cpu_util", "memory.usage", "disk.root.size"
  ];

  $scope.alarmsStatistics = [
    "count", "max", "min", "avg", "sum"
  ];

  $scope.alarmsComparison = [
    {
      text: "<",
      value: "lt"
    },
    {
      text: ">",
      value: "gt"
    },
    {
      text: "=",
      value: "eq"
    }
  ];

  $scope.alarmsPeriod = [
      "30", "60", "90"
  ];

  $scope.actionsAdjustmentTypes = [
    {
      text: "Change in Capacity",
      value: "ChangeInCapacity"
    },
    {
      text: "Exact Capacity",
      value: "ExactCapacity"
    },
    {
      text: "Percent Change in Capacity",
      value: "PercentChangeInCapacity"
    }
  ];

  $scope.actionsScalingAdjustment = [
      "-2", "-1", "+1", "+2"
  ];

  $scope.actionsCooldown = [
      "30", "60", "90"
  ];

  $scope.networkIDs = [
    {
      name: "organization",
      ids: {
        public_net: "2e2bc7f9-c29c-467c-94b6-5ef3724d79ac",
        private_net: "fd704f1b-9238-4c2c-a0f5-4ffb4543e33a",
        private_subnet: "ab4595bf-12d5-4e92-baa8-b5dfb3c1a31d"
      }
    },
    {
      name: "production",
      ids: {
        public_net: "2e2bc7f9-c29c-467c-94b6-5ef3724d79ac",
        private_net: "34d94f44-d12c-42ec-9094-8f97a2b1e922",
        private_subnet: "2e8c55d3-efbf-490a-a405-8cfdf46027b8"
      }
    }
  ];
  $scope.cloudData.networks = $scope.networkIDs[0].ids;

  $scope.updateNetwork = function(net) {
    networkService.set(net);
  };

  function hasNetworkChanged() {
    var _net = networkService.get();
    if ($scope.cloudData.networks != _net) {
      $scope.cloudData.networks = _net;
    }
  };

  function isStackEmpty() {
    $http.get($scope.path).success(function(data) {
      if (data.stacks.length === 0) {
        console.log("No stacks deployed");
        return $scope.stackStatus = true;
      }
      else {
        console.log("Stack has already been deployed.");
        $scope.go('/stacks');
        $scope.alerts = [];
        $scope.alerts.push({type: 'success round', msg: "A stack is already running. If you would like to deploy a new one, the current one has to be deleted first."});
        return $scope.stackStatus = false;
      }
    });
  };

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.go = function (path) {
    $location.path(path);
  };

  $scope.addPolicy = function() {
    $scope.policiesCount.push({});
    console.log("New amount of policies: ", $scope.policiesCount.length);
  }

  $scope.deletePolicy = function(index) {
    $scope.policiesCount.splice(index, 1);
    console.log("New amount of policies: ", $scope.policiesCount.length);
  }

  $scope.savePolicy = function() {
    for (var i = 0; i < $scope.policiesCount.length; i++) {
        $scope.cloudData.media_server_group.policies.push($scope.policiesData[i]);
    }
  }

  $scope.submitForm = function() {
    if ($scope.policiesCount.length > 0) {
      $scope.savePolicy();
      console.log("Policies that are being deployed:");
      console.log($scope.policiesCount.length);
    }
    console.log("--> Submitting form");
    isStackEmpty();
    if ($scope.stackStatus) {
      $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
      var responsePromise = $http({method: 'POST', url: $scope.path, data: JSON.stringify($scope.formData)});
      responsePromise.success(function(dataFromServer, status, headers, config) {
        console.log("Submitted form <--");
        $scope.alerts = [];
        $scope.go('/stacks');
        $scope.alerts.push({type: 'success round', msg: "Stack deploy is in progress."});
      });
      responsePromise.error(function(data, status, headers, config) {
        $scope.alerts = [];
        $scope.alerts.push({type: 'alert round', msg: "Stack deploy failed. Please retry."});
      });
    }
    else {
      $scope.go('/stacks');
      $scope.alerts = [];
      $scope.alerts.push({type: 'alert round', msg: "Only one stack can be deployed at a time. Please delete the running stack first."});
    }
  }

  $scope.$watch('$viewContentLoaded', isStackEmpty);
  $scope.$watch('$viewContentLoaded', hasNetworkChanged);
});

deployStackControllers.controller('StackDetailsCtrl', function($scope, $http, $location, $interval, alarmService) {

  $scope.stackList = {};
  $scope.stackList.stacks = {};
  $scope.stackDetails = [];
  $scope.stackCurrent = [];
  $scope.stackID = [];
  $scope.showPolicies = false;
  $scope.alerts = alarmService.sharedAlarm.alerts;
  $scope.ip = $location.host();
  $scope.path = 'http://' + $scope.ip + ':8080/stacks';
  $scope.msgResources = [];

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  function getStackList() {
    $http.get($scope.ip).success(function(data) {
      $scope.stackList = data;
      console.log("GET Stack list -->");
      console.log($scope.stackList);
      if ($scope.stackList.stacks.length != 0) {
        $scope.stackID = $scope.stackList.stacks[0].id;
        getStackDetails();
      }
    });
  };

  $interval(getStackList, 10000);

  function getStackDetails() {
    $http.get($scope.path + '/' + $scope.stackID).success(function(data) {
      $scope.stackDetails = data;
      console.log("GET Stack details -->");
      console.log($scope.stackDetails);
      $scope.stackCurrent = $scope.stackDetails.stack;
      $scope.msgResources = $scope.stackCurrent.resources.media_server_group.resources;
      console.log("GET MSG-->");
      console.log($scope.msgResources);
    });
  };

  $scope.deleteStack = function() {
    $http.delete($scope.path + '/' + $scope.stackID).success(function(data) {
      console.log("Stack is deleted<--");
      $scope.stackCurrent = null;
      $scope.alerts = [];
      $scope.alerts.push({type: 'success round', msg: "Stack is deleted. You can now deploy a new one."});
    });
  }

  $scope.$watch('$viewContentLoaded', getStackList);

});
