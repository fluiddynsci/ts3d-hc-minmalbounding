var myLayout;

var myPartialExplode;
var mySpriteManager;
var myHeatMap;
var myClippingBox;
var myScaleHandles;
var myDrawingManipulator;
var myMoveOnFloorOperator;
var myFloorGrid;
var mySelectionBasket;
var myMaterialTool;
var myPartArranger;
var handlePlacementOperator;
var navcube;

var myCurveSequence;

var contextMenu;

async function msready() {


}

function continousCheck() {
    hcCurveToolkit.CurveManager.continousControlPoints =  document.getElementById('continuouscheck').checked;
}

function startup()
{
    createUILayout();
} 

function createUILayout() {

    var config = {
        settings: {
            showPopoutIcon: false,
            showMaximiseIcon: true,
            showCloseIcon: false
        },
        content: [
            {
                type: 'row',
                content: [
                    {
                        type: 'column',
                        content: [{
                            type: 'component',
                            componentName: 'Viewer',
                            isClosable: false,
                            width: 83,
                            componentState: { label: 'A' }
                        }],
                    },
                    {
                        type: 'column',
                        width: 17,
                        height: 35,
                        content: [
                            {
                                type: 'component',
                                componentName: 'Settings',
                                isClosable: true,
                                height: 15,
                                componentState: { label: 'C' }
                            }                                                   
                        ]
                    },                  
                ],
            }]
    };



    myLayout = new GoldenLayout(config);
    myLayout.registerComponent('Viewer', function (container, componentState) {
        $(container.getElement()).append($("#content"));
    });

    myLayout.registerComponent('Settings', function (container, componentState) {
        $(container.getElement()).append($("#settingsdiv"));
    });

   

    myLayout.on('stateChanged', function () {
        if (hwv != null) {
            hwv.resizeCanvas();
          
        }
    });
    myLayout.init();

}

function calculateTightBounding() {
    TightBounding.calculateTightBounding(hwv,hwv.selectionManager.getLast().getNodeId());

}

function generateConvexHull() {
    TightBounding.showConvexHull(hwv,hwv.selectionManager.getLast().getNodeId());

}
