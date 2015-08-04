# Deploy a OpenStack Heat stack using a JSON template

This tool was used as part of an OpenStack orchestration tool that only needs a JSON input in order to deploy a new OpenStack Heat stack. This stack consists of three types of instances. The flavors of the different instance types can be set. Additionally the instance types can be scaled with a minimum and maximum amount of instances defined. The scaling is triggered by one or more alarms and defined as an action.

This is an example output of the app:

```json{
    "organization": {  
        "name": "Organization",
        "key_name": "auth_key",
        "connector": {
            "flavor": "m1.small"
        },
        "broker": {
            "flavor": "m1.small"
        },
        "media_server_group": {
            "flavor": "m1.small",
            "min_size": "1",
            "max_size": "3",
            "policies": [
                {
                    "alarm": {
                        "meter_name": "cpu_util",
                        "comparison_operator": "gt",
                        "threshold": "70",
                        "statistic": "avg",
                        "period": "60"
                    },
                    "action": {
                        "adjustment_type": "ChangeInCapacity",
                        "scaling_adjustment": "1",
                        "cooldown": "60"
                    }
                },
                {
                    "alarm": {
                        "meter_name": "cpu_util",
                        "comparison_operator": "lt",
                        "threshold": "10",
                        "statistic": "avg",
                        "period": "60"
                    },
                    "action": {
                        "adjustment_type": "ChangeInCapacity",
                        "scaling_adjustment": "-1",
                        "cooldown": "60"
                    }
                }
            ]
        }
    }
}```

The app has to be served by a webserver, because cross origin requests are made.
