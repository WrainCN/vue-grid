// 注册组件，传入一个扩展的构造器
Vue.component('vue-table', Vue.extend({
    template: template
    ,props:{
        'api':String
        ,"options":{
            type:Object,
            default:function(){
                return {
                    multiSelect:true        //是否多选
                    ,limit:[10,20,50]       //分页设置
                    ,noDataText:"暂无数据"   //没有数据时的文字提示
                    ,checkCol:true          //是否支持勾选
                }
            }
        }
        ,"columns":Array                    //表头
        ,"events":{                         //事件回调
            type:Object,
            default:function(){
                return {
                    click:function(){},
                    dblclick:function(){},
                    callBack:function(){}
                }
            }
        }
        ,"params":{                         //搜索条件
            type:Object,
            default:function(){
                return {}
            }
        }
     }
s}));