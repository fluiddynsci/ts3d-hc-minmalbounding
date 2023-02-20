import { dummy } from './qhull.js';

export class MinimalBounding {

    static async calculateMinimalBounding(viewer, nodeid, iterations = 10000, origBoundsBias = 0.9, steps = 1) {

        let points = await MinimalBounding._getMeshPoints(viewer, nodeid);
        let smallest = { volume: Number.MAX_VALUE, angle: 0, axis: new Communicator.Point3(1, 0, 0), min: new Communicator.Point3(0, 0, 0), max: new Communicator.Point3(0, 0, 0) };

        let origvolume = Number.MAX_VALUE;

        let bounding = await viewer.model.getNodesBounding([nodeid]);
        let axis;
        for (let i = 0; i < 4; i++) {
            let kend = 360 / steps;
            if (i == 0) {
                axis = new Communicator.Point3(0, 0, 1);
            }
            else if (i == 1) {
                axis = new Communicator.Point3(0, 1, 0);
            }
            else if (i == 2) {
                axis = new Communicator.Point3(1, 0, 0);
            }
            else {
                kend = iterations;
            }
            for (let k = 0; k < kend; k++) {

                let angle;
                if (i > 2) {

                    axis = new Communicator.Point3(Math.random(), Math.random(), Math.random());
                    axis.normalize();
                    angle = Math.random() * 360;
                }
                else {
                    angle = k * steps;
                }

                let matrix = await MinimalBounding._rotateNode(viewer, nodeid, axis, angle, bounding.center(), false);

                let min = new Communicator.Point3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
                let max = new Communicator.Point3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

                let netmatrix2 = viewer.model.getNodeNetMatrix(viewer.model.getNodeParent(nodeid));
                let netmatrix = Communicator.Matrix.multiply(matrix, netmatrix2);
                
                let resp = [];
                netmatrix.transformArray(points, resp);
                for (let j = 0; j < points.length; j++) {
                    let p = resp[j];
                    if (p.x < min.x) min.x = p.x;
                    if (p.y < min.y) min.y = p.y;
                    if (p.z < min.z) min.z = p.z;
                    if (p.x > max.x) max.x = p.x;
                    if (p.y > max.y) max.y = p.y;
                    if (p.z > max.z) max.z = p.z;
                }

                let volume = (max.x - min.x) * (max.y - min.y) * (max.z - min.z);

                if (volume < smallest.volume) {

                    if ((volume / origvolume) > origBoundsBias) {
                        continue;
                    }
                    if (i < 3) {
                        origvolume = volume;
                    }
                    smallest.volume = volume;
                    smallest.angle = angle;
                    smallest.axis = axis;
                    smallest.min = min;
                    smallest.max = max;
                }

            }
        }

        let mesh = await MinimalBounding._createBoundingMesh(viewer, smallest.min, smallest.max);
        let myMeshInstanceData = new Communicator.MeshInstanceData(mesh);
        let boundingNode = viewer.model.createNode(viewer.model.getRootNode(), "Minimal Bounding for " + nodeid);

        let tempNode = await viewer.model.createMeshInstance(myMeshInstanceData, boundingNode);
        await MinimalBounding._rotateNode(viewer, tempNode, smallest.axis, -smallest.angle, bounding.center(), true)
        return {nodeid: boundingNode, volume: smallest.volume, min: smallest.min, max: smallest.max};

    }

    static async showConvexHull(viewer, nodeid) {
        let points = [];
        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);
        await MinimalBounding._getMeshPointsRecursive(viewer, nodeid, points, netmatrixinverse, true);

        let res = new QuickHull(points);
        res.build();
        let faces = res.collectFaces();
        var meshData = new Communicator.MeshData();
        meshData.setFaceWinding(Communicator.FaceWinding.None);
        let meshFaces = [];
        for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            for (let j = 0; j < 3; j++) {
                let pi = face[j]
                meshFaces.push(points[pi][0], points[pi][1], points[pi][2]);
            }
        }

        meshData.addFaces(meshFaces);
        let meshid = await viewer.model.createMesh(meshData);
        let myMeshInstanceData = new Communicator.MeshInstanceData(meshid);
        var hullNode = viewer.model.createNode(viewer.model.getRootNode(), "Convex Hull for " + nodeid);
        await viewer.model.createMeshInstance(myMeshInstanceData, hullNode);
        return hullNode;
    }


    static async showBoundingMesh(viewer, nodeid) {
        let model = viewer.model;
        let bounding = await model.getNodesBounding([nodeid], { tightBounding: true });
        let mesh = await MinimalBounding._createBoundingMesh(viewer, bounding.min, bounding.max);
        let myMeshInstanceData = new Communicator.MeshInstanceData(mesh);
        let boundingNode = viewer.model.createNode(viewer.model.getRootNode(), "Bounding for " + nodeid);
        let tempNode = await viewer.model.createMeshInstance(myMeshInstanceData, boundingNode);
        viewer.model.setNodesLineColor([tempNode], new Communicator.Color(0, 0, 255));
        return boundingNode;
    }

    static async _getMeshPointsRecursive(viewer, nodeid, points, matrix, useLocalMatrix = false) {
        let children = await viewer.model.getNodeChildren(nodeid);

        try {
            if (children.length == 0) {

                let meshdata = await viewer.model.getNodeMeshData(nodeid);
                if (meshdata) {

                    let totalmatrix;
                    if (!useLocalMatrix) {
                        let netmatrix = viewer.model.getNodeNetMatrix(nodeid);
                        totalmatrix = Communicator.Matrix.multiply(netmatrix, matrix);
                    }
                    else {
                        totalmatrix = viewer.model.getNodeNetMatrix(nodeid);

                    }

                    let data = await viewer.model.getNodeMeshData(nodeid);

                    for (let i = 0; i < data.faces.elementCount; i++) {
                        let face = data.faces.element(i);
                        let pp = face.iterate();
                        for (let j = 0; j < face.vertexCount; j += 3) {
                            for (let k = 0; k < 3; k++) {
                                let rawpoint = pp.next();
                                let p = new Communicator.Point3(rawpoint.position[0], rawpoint.position[1], rawpoint.position[2]);
                                let tp = totalmatrix.transform(p);
                                points.push([tp.x, tp.y, tp.z]);
                            }
                        }
                    }
                }
            }
        } catch (e) {

        }

        for (let i = 0; i < children.length; i++) {
            await MinimalBounding._getMeshPointsRecursive(viewer, children[i], points, matrix, useLocalMatrix);
        }
    }

    static async _getMeshPoints(viewer, nodeid) {
        let points = [];
        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);

        await MinimalBounding._getMeshPointsRecursive(viewer, nodeid, points, netmatrixinverse);

        let respoints = [];
        let res = new QuickHull(points);
        res.build();
        let faces = res.collectFaces();
        let phash = [];
        for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            for (let j = 0; j < 3; j++) {
                let pi = face[j]
                if (phash[pi] == undefined) {
                    phash[pi] = 1;
                    let p = new Communicator.Point3(points[pi][0], points[pi][1], points[pi][2]);
                    respoints.push(p);
                }
            }
        }
        return respoints;
    }

    static async _rotateNode(viewer, nodeid, axis, angle, center, apply) {
        let pos = center;

        var netmatrix = viewer.model.getNodeNetMatrix(nodeid);
        var netmatrixinverse = Communicator.Matrix.inverse(netmatrix);
        var pivot = netmatrixinverse.transform(pos);

        var pivotaxis = netmatrixinverse.transform(new Communicator.Point3(pos.x + axis.x, pos.y + axis.y, pos.z + axis.z));
        var resaxis = Communicator.Point3.subtract(pivotaxis, pivot).normalize();

        return await MinimalBounding._rotateNodeOffaxis(viewer, nodeid, angle, pivot, resaxis, apply);
    }

    static async _rotateNodeOffaxis(viewer, nodeid, angle, center, axis, apply) {

        var startmatrix = viewer.model.getNodeMatrix(nodeid);
        var offaxismatrix = new Communicator.Matrix();
        var transmatrix = new Communicator.Matrix();

        transmatrix = new Communicator.Matrix();
        transmatrix.setTranslationComponent(-center.x, -center.y, -center.z);

        var invtransmatrix = new Communicator.Matrix();
        invtransmatrix.setTranslationComponent(center.x, center.y, center.z);

        Communicator.Util.computeOffaxisRotation(axis, angle, offaxismatrix);

        var result = Communicator.Matrix.multiply(transmatrix, offaxismatrix);
        var result2 = Communicator.Matrix.multiply(result, invtransmatrix);

        let final = Communicator.Matrix.multiply(result2, startmatrix);
        if (apply) {
            await viewer.model.setNodeMatrix(nodeid, final);
        }
        return final;
    }

    static async _createBoundingMesh(viewer, min, max) {

        var meshData = new Communicator.MeshData();

        var polylines = [
            [
                min.x, min.y, min.z,
                max.x, min.y, min.z,
                max.x, max.y, min.z,
                min.x, max.y, min.z,
                min.x, min.y, min.z
            ],
            [
                min.x, min.y, max.z,
                max.x, min.y, max.z,
                max.x, max.y, max.z,
                min.x, max.y, max.z,
                min.x, min.y, max.z
            ],
            [
                min.x, min.y, min.z,
                min.x, min.y, max.z,
                max.x, min.y, max.z,
                max.x, max.y, max.z,
                min.x, max.y, max.z
            ],
            [
                max.x, max.y, min.z,
                max.x, max.y, max.z,
            ],
            [
                min.x, max.y, min.z,
                min.x, max.y, max.z,
            ],
            [
                max.x, min.y, min.z,
                max.x, min.y, max.z,
            ],
        ];
        for (let i = 0; i < polylines.length; i++) {
            meshData.addPolyline(polylines[i]);
        }
        return await viewer.model.createMesh(meshData);
    }
}