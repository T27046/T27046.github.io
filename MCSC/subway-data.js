// 地铁线路数据 - 以线路为中心的存储结构
const subwayData = `lineId,lineName,color,isExpress,stationSequence
K1,K1,#53c700,true,"旧园:1,纽克北站:2"
K2,K2,#005eff,true,"新城口:1,旧园郊(快船):2"

近西南线,近西南线,#ffd500,false,"旧园:1,旧园郊(铁路):2,劫掠前哨:3,纽克站:4"
北桥线,北桥线,#ff8fa4,false,"旧园:1,北桥:2"

N1,N1,#E3002B,false,"纽克北站:1,工业园:2,纽克站:3"
HCL专线,HCL专线,#bfa15c,false,"沙北站:1,府邸:2,阿萨伟:3"

S1,S1,#00c3ff,false,"新城口:1,仙雪:2,十字口:3,速炉:4"
S2,S2,#00ffaa,false,"新城口:1,渔场:2"
S3,S3,#fcba77,false,"工业园:1,十字口:2"
S4,S4,#ff5900,false,"旧园:1,新城口:2"
S5,S5,#b7ff00,false,"渔场:1,旧园:2"
S6,S6,#b7ff00,false,"旧园郊(铁路):1,南江畔:2,近东南一村:3"
S9,S9,#92b0a8,false,"十字口:1,北桥泰加:2,沙北东站:3"


`;

// 站点坐标信息（单独存储）
const stationCoordinates = `name,englishName,X,Y,transfer,transferLines,transferPlatforms,isMajor
旧园,Jiuyuan,-137,66,true,"K1,近西南线,北桥线,S2,S4","3F,地下,2F,2F,2F",true
旧园郊(快船),Jiuyuanjiao (Express),-247,146,true,,,false
旧园郊(铁路),Jiuyuanjiao (Railway),-222,226,true,"近西南线,S6","-1F,-2F",false

新城口,Xinchengkou,-238,18,true,"K2,S1","2F,1F",true
仙雪,Xianxue,-284,16,false,,,false
十字口,Shizikou,-330,16,true,"S1,S3,S9","站台 1 ,站台 2 ,站台 3",true
速炉,Sulu,-377,16,false,,,false
渔场,Yuchang,-206,66,true,"S2,S5","1F,2F",false
沙北东站,Shabei East Station,-325,-490,false,,,false
沙北站,Shabei Station,-522,-550,true,“HCL”,"",false

工业园,Gongyeyuan,-814,255,true,"N1,S3","A,B",false
纽克北站,Niuke North Station,-963,93,true,"K1,N1","地上,地下",false
劫掠前哨,Jielueqianshao,-630,233,false,,,false
纽克站,Niuke Station,-800,333,true,"近西南线,N1","地上,地下",false
阿萨伟,Asawei,-900,-370,false,,,false
府邸,Fudi,-757,264,true,,,false

北桥,Beiqiao,-136,-224,false,,,false
北桥泰加,Beiqiao Taiga,-330,-224,false,,,false


南江畔,Nanjiangpan,-42,226,false,,,false
近东南一村,Jindongnan I,125,226,false,,,false

`;

// 导出数据供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { subwayData, stationCoordinates };
}