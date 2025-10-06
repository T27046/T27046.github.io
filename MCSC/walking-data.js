// 步行路数据 - 步行路线路类型 
const walkingData = `color,isExpress,lineType,stationSequence
#808080,false,walking,"旧园郊(铁路):1,旧园郊(快船):2"
#808080,false,walking,"府邸:1,工业园:2"
#808080,false,walking,"北桥:1,北桥泰加:2"
`;

// 导出数据供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { walkingData };
}