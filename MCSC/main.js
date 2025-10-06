import L from 'leaflet';
import Papa from 'papaparse';

// 初始化地图
const map = L.map('map').setView([39.9042, 116.4074], 12); // 默认北京中心

// 添加OpenStreetMap图层
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// 应用状态管理
let appState = {
    subwayData: null,
    stations: [],
    lines: [],
    route: null,
    routeLayers: [],
    markers: []
};

// DOM元素
const elements = {
    importBtn: document.getElementById('importBtn'),
    clearBtn: document.getElementById('clearBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    mapFileInput: document.getElementById('mapFileInput'),
    dataInfo: document.getElementById('dataInfo'),
    startStation: document.getElementById('startStation'),
    endStation: document.getElementById('endStation'),
    calculateRoute: document.getElementById('calculateRoute'),
    routeInfo: document.getElementById('routeInfo'),
    transferInfo: document.getElementById('transferInfo'),
    zoomIn: document.getElementById('zoomIn'),
    zoomOut: document.getElementById('zoomOut')
};

// 工具函数
const utils = {
    // 显示通知
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // 生成随机颜色
    getLineColor(lineId) {
        const colors = ['#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#34495e', '#1abc9c', '#d35400'];
        return colors[lineId % colors.length];
    }
};

// 轨道交通数据处理
const subwayProcessor = {
    // 处理CSV格式的地铁数据
    processCSVData(csvText) {
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(new Error('CSV解析错误: ' + results.errors[0].message));
                        return;
                    }
                    
                    const stations = results.data
                        .filter(row => row.lat && row.lng && row.name && row.line)
                        .map((row, index) => ({
                            id: index,
                            name: row.name.trim(),
                            lat: parseFloat(row.lat),
                            lng: parseFloat(row.lng),
                            line: row.line.trim(),
                            lineId: parseInt(row.lineId) || 0,
                            transfer: row.transfer === 'true',
                            sequence: parseInt(row.sequence) || 0
                        }));
                    
                    // 按线路分组
                    const lines = this.groupStationsByLine(stations);
                    
                    resolve({ stations, lines });
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    },

    // 按线路分组站点
    groupStationsByLine(stations) {
        const lineMap = new Map();
        
        stations.forEach(station => {
            if (!lineMap.has(station.line)) {
                lineMap.set(station.line, {
                    id: station.lineId,
                    name: station.line,
                    color: utils.getLineColor(station.lineId),
                    stations: []
                });
            }
            lineMap.get(station.line).stations.push(station);
        });

        // 按站点顺序排序，支持sequenceList
        lineMap.forEach(line => {
            line.stations.sort((a, b) => {
                // 优先使用sequenceList中对应线路的顺序
                const aSeqList = a.sequenceList || [a.sequence];
                const bSeqList = b.sequenceList || [b.sequence];
                
                // 使用第一个有效的序列值进行排序
                const aSeq = aSeqList.length > 0 ? aSeqList[0] : a.sequence;
                const bSeq = bSeqList.length > 0 ? bSeqList[0] : b.sequence;
                
                return aSeq - bSeq;
            });
        });

        return Array.from(lineMap.values());
    },

    // 在地图上显示地铁线路和站点
    displaySubwayOnMap(subwayData) {
        // 清除现有标记和线路
        this.clearMap();

        const { stations, lines } = subwayData;
        
        // 显示线路
        lines.forEach(line => {
            const linePoints = line.stations.map(station => [station.lat, station.lng]);
            const polyline = L.polyline(linePoints, {
                color: line.color,
                weight: 6,
                opacity: 0.8,
                className: `line-${line.id}`
            }).addTo(map);
            
            appState.routeLayers.push(polyline);

            // 添加线路名称标注
            if (linePoints.length > 0) {
                const midIndex = Math.floor(linePoints.length / 2);
                L.marker(linePoints[midIndex])
                    .bindPopup(`<strong>${line.name}</strong>`)
                    .addTo(map);
            }
        });

        // 显示站点
        stations.forEach(station => {
            const marker = L.marker([station.lat, station.lng], {
                icon: L.divIcon({
                    className: `station-marker line-${station.lineId}`,
                    html: '<div></div>',
                    iconSize: [12, 12]
                })
            }).bindPopup(`
                <div>
                    <strong>${station.name}</strong><br>
                    线路: ${station.line}<br>
                    ${station.transfer ? '换乘站' : ''}
                </div>
            `).addTo(map);
            
            appState.markers.push(marker);
        });

        // 调整地图视图
        if (stations.length > 0) {
            const group = new L.featureGroup(appState.markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }

        // 更新站点选择下拉框
        this.updateStationSelects(stations);
    },

    // 更新站点选择下拉框
    updateStationSelects(stations) {
        const startSelect = elements.startStation;
        const endSelect = elements.endStation;
        
        // 清空现有选项
        startSelect.innerHTML = '<option value="">选择起点站</option>';
        endSelect.innerHTML = '<option value="">选择终点站</option>';
        
        // 添加站点选项
        stations.forEach(station => {
            const option = document.createElement('option');
            option.value = station.id;
            option.textContent = `${station.name} (${station.line})`;
            
            startSelect.appendChild(option.cloneNode(true));
            endSelect.appendChild(option);
        });
    },

    // 清除地图上的所有元素
    clearMap() {
        appState.markers.forEach(marker => map.removeLayer(marker));
        appState.routeLayers.forEach(layer => map.removeLayer(layer));
        appState.markers = [];
        appState.routeLayers = [];
    }
};

// 路径规划功能（地铁专用）
const subwayRoutePlanner = {
    // 构建地铁网络图
    buildSubwayGraph(stations, lines) {
        const graph = new Map();
        
        // 初始化所有站点
        stations.forEach(station => {
            graph.set(station.id, {
                station: station,
                neighbors: new Map(),
                distance: Infinity,
                previous: null,
                visited: false
            });
        });

        // 添加同线路相邻站点的连接
        lines.forEach(line => {
            const lineStations = line.stations;
            for (let i = 0; i < lineStations.length - 1; i++) {
                const current = lineStations[i];
                const next = lineStations[i + 1];
                
                // 计算相邻站点间的距离（简化版，使用直线距离）
                const distance = this.calculateStationDistance(current, next);
                
                graph.get(current.id).neighbors.set(next.id, { station: next, distance, line: line.name });
                graph.get(next.id).neighbors.set(current.id, { station: current, distance, line: line.name });
            }
        });

        // 添加换乘站连接（同一站点的不同线路）
        const transferStations = stations.filter(s => s.transfer);
        transferStations.forEach(transferStation => {
            const sameLocationStations = stations.filter(s => 
                s.lat === transferStation.lat && 
                s.lng === transferStation.lng && 
                s.id !== transferStation.id
            );
            
            sameLocationStations.forEach(sameStation => {
                // 换乘距离设为0（同一位置）
                graph.get(transferStation.id).neighbors.set(sameStation.id, { 
                    station: sameStation, 
                    distance: 0, 
                    line: '换乘',
                    isTransfer: true 
                });
            });
        });

        return graph;
    },

    // 计算站点间距离（简化版）
    calculateStationDistance(station1, station2) {
        const R = 6371; // 地球半径（公里）
        const dLat = (station2.lat - station1.lat) * Math.PI / 180;
        const dLon = (station2.lng - station1.lng) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(station1.lat * Math.PI / 180) * Math.cos(station2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    // Dijkstra算法寻找最短路径
    findShortestPath(graph, startId, endId) {
        // 重置图状态
        graph.forEach(node => {
            node.distance = Infinity;
            node.previous = null;
            node.visited = false;
        });

        // 设置起点
        graph.get(startId).distance = 0;

        const unvisited = new Set(Array.from(graph.keys()));

        while (unvisited.size > 0) {
            // 找到未访问节点中距离最小的
            let currentId = null;
            let minDistance = Infinity;
            
            unvisited.forEach(id => {
                const node = graph.get(id);
                if (!node.visited && node.distance < minDistance) {
                    minDistance = node.distance;
                    currentId = id;
                }
            });

            if (currentId === null || currentId === endId) break;

            const currentNode = graph.get(currentId);
            currentNode.visited = true;
            unvisited.delete(currentId);

            // 更新邻居节点距离
            currentNode.neighbors.forEach((neighbor, neighborId) => {
                if (!graph.get(neighborId).visited) {
                    const newDistance = currentNode.distance + neighbor.distance;
                    if (newDistance < graph.get(neighborId).distance) {
                        graph.get(neighborId).distance = newDistance;
                        graph.get(neighborId).previous = {
                            station: currentNode.station,
                            line: neighbor.line,
                            isTransfer: neighbor.isTransfer
                        };
                    }
                }
            });
        }

        // 构建路径
        const path = [];
        let currentId = endId;
        
        while (currentId !== null) {
            const currentNode = graph.get(currentId);
            path.unshift(currentNode.station);
            
            if (currentNode.previous) {
                path.unshift({
                    type: currentNode.previous.isTransfer ? 'transfer' : 'route',
                    line: currentNode.previous.line,
                    fromStation: currentNode.previous.station
                });
                currentId = currentNode.previous.station.id;
            } else {
                currentId = null;
            }
        }

        return path.filter(item => item.station); // 过滤掉路由信息，只保留站点
    },

    // 在地图上绘制路径
    drawRoute(path, lines) {
        // 清除现有路径标记
        appState.routeLayers.forEach(layer => map.removeLayer(layer));
        appState.routeLayers = [];

        if (path.length < 2) {
            utils.showNotification('路径站点数量不足', 'error');
            return null;
        }

        let totalDistance = 0;
        let transferCount = 0;
        let currentLine = null;
        const routeSegments = [];
        let currentSegment = [];

        // 分析路径并分段绘制
        for (let i = 0; i < path.length; i++) {
            const station = path[i];
            
            if (i > 0) {
                const prevStation = path[i-1];
                const distance = this.calculateStationDistance(prevStation, station);
                totalDistance += distance;

                // 检查是否换线
                if (station.line !== prevStation.line) {
                    transferCount++;
                    
                    // 完成当前线段
                    if (currentSegment.length > 0) {
                        routeSegments.push({
                            line: currentLine,
                            stations: currentSegment
                        });
                        currentSegment = [];
                    }
                    
                    currentLine = station.line;
                }
            } else {
                currentLine = station.line;
            }

            currentSegment.push(station);

            // 添加站点标记
            const marker = L.marker([station.lat, station.lng])
                .bindPopup(`<strong>${station.name}</strong><br>${station.line}`)
                .addTo(map);
            appState.routeLayers.push(marker);
        }

        // 添加最后一段
        if (currentSegment.length > 0) {
            routeSegments.push({
                line: currentLine,
                stations: currentSegment
            });
        }

        // 绘制各段线路
        routeSegments.forEach(segment => {
            const linePoints = segment.stations.map(s => [s.lat, s.lng]);
            const lineColor = lines.find(l => l.name === segment.line)?.color || '#3498db';
            
            const polyline = L.polyline(linePoints, {
                color: lineColor,
                weight: 8,
                opacity: 0.9
            }).addTo(map);
            
            appState.routeLayers.push(polyline);
        });

        return { totalDistance, transferCount, routeSegments };
    },

    // 生成换乘信息
    generateTransferInfo(routeInfo, path) {
        const transferInfo = elements.transferInfo;
        transferInfo.innerHTML = '';

        if (!routeInfo) return;

        const { totalDistance, transferCount, routeSegments } = routeInfo;

        // 显示总体信息
        const summary = document.createElement('div');
        summary.className = 'transfer-step';
        summary.innerHTML = `
            <strong>路径概要</strong><br>
            总距离: ${totalDistance.toFixed(2)} 米<br>
            换乘次数: ${transferCount} 次<br>
            途经站点: ${path.length} 个
        `;
        transferInfo.appendChild(summary);

        // 显示详细换乘信息
        routeSegments.forEach((segment, index) => {
            const step = document.createElement('div');
            step.className = `transfer-step line-${index + 1}`;
            
            const startStation = segment.stations[0];
            const endStation = segment.stations[segment.stations.length - 1];
            
            step.innerHTML = `
                <strong>第${index + 1}段: ${segment.line}</strong><br>
                从 ${startStation.name} 到 ${endStation.name}<br>
                途经 ${segment.stations.length} 站
            `;
            
            transferInfo.appendChild(step);
        });
    }
};



// 事件处理
const eventHandlers = {
    // 导入地铁数据
    handleImport() {
        elements.mapFileInput.click();
    },

    // 处理文件选择
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const fileContent = e.target.result;
                let subwayData;

                if (file.name.endsWith('.csv')) {
                    subwayData = await subwayProcessor.processCSVData(fileContent);
                } else {
                    throw new Error('目前仅支持CSV格式的地铁数据');
                }

                if (subwayData.stations.length === 0) {
                    throw new Error('文件中没有有效的地铁站点数据');
                }

                appState.subwayData = subwayData;
                subwayProcessor.displaySubwayOnMap(subwayData);
                
                // 更新数据信息
                elements.dataInfo.innerHTML = `
                    <p><strong>文件:</strong> ${file.name}</p>
                    <p><strong>线路数:</strong> ${subwayData.lines.length}</p>
                    <p><strong>站点数:</strong> ${subwayData.stations.length}</p>
                    <p><strong>换乘站:</strong> ${subwayData.stations.filter(s => s.transfer).length}</p>
                `;

                utils.showNotification(`成功导入 ${subwayData.stations.length} 个地铁站点`);
            } catch (error) {
                utils.showNotification(error.message, 'error');
                console.error('导入错误:', error);
            }
        };

        reader.readAsText(file);
        event.target.value = ''; // 重置文件输入
    },

    // 加载示例数据
    handleLoadSample() {
        const sampleData = sampleData.loadBeijingSubwaySample();
        appState.subwayData = sampleData;
        subwayProcessor.displaySubwayOnMap(sampleData);
        
        elements.dataInfo.innerHTML = `
            <p><strong>数据:</strong> 北京地铁示例</p>
            <p><strong>线路数:</strong> ${sampleData.lines.length}</p>
            <p><strong>站点数:</strong> ${sampleData.stations.length}</p>
            <p><strong>换乘站:</strong> ${sampleData.stations.filter(s => s.transfer).length}</p>
        `;
        
        utils.showNotification('示例数据加载成功');
    },

    // 清除地图
    handleClear() {
        subwayProcessor.clearMap();
        appState.subwayData = null;
        appState.route = null;
        
        elements.dataInfo.innerHTML = '<p>尚未导入线路数据</p>';
        elements.routeInfo.innerHTML = '';
        elements.transferInfo.innerHTML = '<p>路径规划后显示换乘信息</p>';
        
        // 重置站点选择
        elements.startStation.innerHTML = '<option value="">选择起点站</option>';
        elements.endStation.innerHTML = '<option value="">选择终点站</option>';
        
        utils.showNotification('地图已清除');
    },

    // 计算路径
    handleCalculateRoute() {
        if (!appState.subwayData) {
            utils.showNotification('请先导入地铁数据', 'error');
            return;
        }

        const startId = parseInt(elements.startStation.value);
        const endId = parseInt(elements.endStation.value);

        if (!startId || !endId) {
            utils.showNotification('请选择起点和终点站', 'error');
            return;
        }

        if (startId === endId) {
            utils.showNotification('起点和终点不能相同', 'error');
            return;
        }

        const { stations, lines } = appState.subwayData;
        const graph = subwayRoutePlanner.buildSubwayGraph(stations, lines);
        const path = subwayRoutePlanner.findShortestPath(graph, startId, endId);

        if (path.length === 0) {
            utils.showNotification('无法找到路径', 'error');
            return;
        }

        const routeInfo = subwayRoutePlanner.drawRoute(path, lines);
        subwayRoutePlanner.generateTransferInfo(routeInfo, path);
        
        if (routeInfo) {
            elements.routeInfo.innerHTML = `
                <p><strong>路径规划完成</strong></p>
                <p>总距离: ${routeInfo.totalDistance.toFixed(2)} m</p>
                <p>换乘次数: ${routeInfo.transferCount}</p>
                <p>途经站点: ${path.length}</p>
            `;
            utils.showNotification('路径规划完成');
        }
    },

    // 地图缩放控制
    handleZoomIn() {
        map.zoomIn();
    },

    handleZoomOut() {
        map.zoomOut();
    }
};

// 初始化事件监听器
function initializeEventListeners() {
    elements.importBtn.addEventListener('click', eventHandlers.handleImport);
    elements.clearBtn.addEventListener('click', eventHandlers.handleClear);
    elements.loadSampleBtn.addEventListener('click', eventHandlers.handleLoadSample);
    elements.calculateRoute.addEventListener('click', eventHandlers.handleCalculateRoute);
    elements.mapFileInput.addEventListener('change', eventHandlers.handleFileSelect);
    elements.zoomIn.addEventListener('click', eventHandlers.handleZoomIn);
    elements.zoomOut.addEventListener('click', eventHandlers.handleZoomOut);
}

// 初始化应用
function initializeApp() {
    initializeEventListeners();
    console.log('轨道交通导航软件初始化完成');
}

// 启动应用
document.addEventListener('DOMContentLoaded', initializeApp);