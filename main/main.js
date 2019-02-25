const database = require('./datbase.js');

/**
 * 打印购物清单
 *
 * @param inputs
 */
function printInventory(inputs) {
    let items = database.loadAllItems();
    let promotions = database.loadPromotions();

    let inputOfJsonFormat = preProInput(inputs);
    let model = calcModel(inputOfJsonFormat, items, promotions);
    let view = generateMsg(model);
    console.log(view);
};

/**
 * 预处理输入数据
 *
 * @param inputs
 * @return {Array}
 * @description
 * inputFormat:
 * [barcode1, barcode2]
 * outputFormat:
 * [{
 *     barcode: ITEM000001,
 *     quantity: 5,
 * },
 * {
 *     barcode: ITEM000003,
 *     quantity: 2,
 * },
 * {
 *     barcode: ITEM000005,
 *     quantity: 3,
 * }]
 */
function preProInput(inputs) {
    let output = [];
    inputs.forEach(item => {
        let itemArr = item.split('-');
        let matchObj = output.filter(function (e) {
            return e.barcode === itemArr[0];
        });
        if (matchObj === undefined || matchObj.length === 0) {
            let quantity = itemArr[1] === undefined ? 1 : Number(itemArr[1]);
            output.push({barcode: itemArr[0], quantity: quantity});
        }
        else {
            matchObj[0].quantity += 1;
        }
    });
    return output;
}

/**
 * 生成购物清单
 *
 * @param inputOfJsonFormat
 * @param items
 * @param promotions
 * @return {String}
 */

/*
outputFormat:
{
    itemLists: [{
        name: '雪碧',
        quantity: 5,
        unit: '瓶',
        price: 3.00,
        priceUnit: '元',
        sumPrice: 12.00
    },
    {
        name: '荔枝',
        quantity: 2,
        unit: '斤',
        price: 15.00,
        priceUnit: '元',
        sumPrice: 30.00
    },
    {
        name: '方便面',
        quantity: 3,
        unit: '袋',
        price: 4.50,
        priceUnit: '元',
        sumPrice: 9.00
    }],
    presentLists:[{
        name: '雪碧',
        quantity: 1,
        price: 3.00
        unit: '瓶'
    },
    {
        name: '方便面',
        quantity: 1,
        price: 4.50,
        unit: '袋'
    }],
    summary:{
        totalPrice: 51.00,
        economize: 7.50,
        unit: '元'
    }
}
 */
function calcModel(inputOfJsonFormat, items, promotions) {
    let itemLists = [];
    let presentLists = [];
    let summary = {};

    inputOfJsonFormat.forEach(item => {
        let obj = items.filter(function (e) {
            return e.barcode === item.barcode;
        });
        if (promotions[0].barcodes.indexOf(item.barcode) === -1) {
            itemLists.push({
                name: obj[0].name,
                quantity: item.quantity,
                unit: obj[0].unit,
                price: obj[0].price.toFixed(2),
                priceUnit: '元',
                sumPrice: Number(item.quantity * obj[0].price).toFixed(2)
            });
        } else {
            itemLists.push({
                name: obj[0].name,
                quantity: item.quantity,
                unit: obj[0].unit,
                price: obj[0].price.toFixed(2),
                priceUnit: '元',
                sumPrice: Number((item.quantity - Math.floor(item.quantity / 3)) * obj[0].price).toFixed(2)
            });
            presentLists.push({
                name: obj[0].name,
                quantity: Math.floor(item.quantity / 3),
                price: obj[0].price.toFixed(2),
                unit: obj[0].unit
            });
        }

    });
    let totalPrice = 0;
    let economize = 0;
    itemLists.forEach(item => {
        totalPrice += Number(item.sumPrice);
    });
    presentLists.forEach(item => {
        economize += item.quantity * item.price;
    });
    summary = {totalPrice: totalPrice.toFixed(2), economize: economize.toFixed(2), unit: '元'};
    return {itemLists: itemLists, presentLists: presentLists, summary: summary};
}

function generateMsg(model) {
    let cartOrderMsg = '***<没钱赚商店>购物清单***\n';
    model.itemLists.forEach(item => {
        cartOrderMsg += '名称：' + item.name + '，' + '数量：' + item.quantity + item.unit + '，单价：' + item.price + '(' + item.priceUnit + ')，小计：' + item.sumPrice + '(' + item.priceUnit + ')\n';
    });
    cartOrderMsg += '----------------------\n';
    cartOrderMsg += '挥泪赠送商品：\n';
    model.presentLists.forEach(item => {
        cartOrderMsg += '名称：' + item.name + '，数量：' + item.quantity + item.unit + '\n';
    });
    cartOrderMsg += '----------------------\n';
    cartOrderMsg += '总计：' + model.summary.totalPrice + '(' + model.summary.unit + ')\n';
    cartOrderMsg += '节省：' + model.summary.economize + '(' + model.summary.unit + ')\n';
    cartOrderMsg += '**********************';
    return cartOrderMsg;
}

module.exports = {
    printInventory: printInventory
};