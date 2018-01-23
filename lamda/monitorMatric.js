/**
 * get CPUUtilization matric of all ec2 your account
 */
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
var cw = new AWS.CloudWatch();
var ec2 = new AWS.EC2();

exports.handler = function(event, context) {
    var end = new Date();
    var start = new Date(end);
    start.setMinutes(end.getMinutes() - 60);

    ec2.describeInstances(function(err, data){
        for(var r=0,rlen=data.Reservations.length; r<rlen; r++) {
            var reservation = data.Reservations[r];
            for(var i=0,ilen=reservation.Instances.length; i<ilen; ++i) {
                var instance = reservation.Instances[i];
                var params = {
                    EndTime: end.toISOString(),
                    MetricName: 'CPUUtilization',
                    Namespace: 'AWS/EC2',
                    Period: 60,
                    StartTime: start.toISOString(),
                    Dimensions: [
                        {
                            Name: 'InstanceId',
                            Value: instance.InstanceId
                        }],
                    Statistics: ['Average'],
                    Unit: 'Percent'
                };

                for(var t=0,tlen=instance.Tags.length; t<tlen; ++t) {
                    if(instance.Tags[t].Key === 'Name') {
                        var name = instance.Tags[t].Value;
                    }
                }
                cpu(params,name,instance.InstanceId);
            }
        }
    });
}

function cpu(params,name,id){
    cw.getMetricStatistics(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else
            var max = 0;
        for(var r=0,rlen=data.Datapoints.length; r<rlen; r++) {
            if(max < data.Datapoints[r].Average){
                max = data.Datapoints[r].Average;
            }
        }
    });
}





