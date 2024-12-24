import {useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import { AgGridReact } from 'ag-grid-react';
import { InfiniteRowModelModule, ModuleRegistry } from 'ag-grid-community'; 
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme CSS

ModuleRegistry.registerModules([ InfiniteRowModelModule ]); 


function App() {
  // Column Definitions
  const [columnDefs, setColumnDefs] = useState([
    { field: 'id', headerName: 'ID', sortable: true, filter: true },
    { field: 'name', headerName: 'Name', sortable: true, filter: true },
    { field: 'username', headerName: 'Username', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    { field: 'city', headerName: 'City', sortable: true, filter: true },
  ]);

  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
      sortable: false,
    };
  }, []);

  // The grid is configure via props on the AgGrid component 
  const onGridReady = useCallback( async (params) => {

    try{
      params.api?.showLoadingOverlay(); // Show loading spinner
      const response = await axios.get(`https://json-server-vercel-inky.vercel.app/users`);
      const data = response.data;
      // To Append nested object value using this foreach method
      data.forEach(function (d) {
        d.city = d.address?.city;
      });
      const dataSource = {
        rowCount: undefined,
        getRows: (params) => {
          //console.log("asking for " + params.startRow + " to " + params.endRow,);
          // To make the demo look real, wait for 500ms before returning
          setTimeout(function () {
            // take a slice of the total rows
            const rowsThisPage = data.slice(params.startRow, params.endRow);
            // if on or after the last page, work out the last row.
            let lastRow = -1;
            if (data.length <= params.endRow) {
              lastRow = data.length;
            }
            params.api?.hideOverlay(); // Hide loading spinner after data is loaded
            // call the success callback
            params.successCallback(rowsThisPage, lastRow);
          }, 500); // Delay for data loading

        },
      };
      params.api.setGridOption("datasource", dataSource);

    }catch(err){
        console.log(err);
        //Display an error overlay
        params.api.showNoRowsOverlay();
    }
    
  }, []);

  return (
    <>
      <h1 style={{textAlign:"center"}}>Display Users using AG Grid</h1>
      <div className="ag-theme-alpine" style={{ width: '100%', height: '100vh' }}>
      
        <AgGridReact
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowBuffer={0}
          rowModelType={"infinite"}
          cacheBlockSize={100}
          cacheOverflowSize={2}
          maxConcurrentDatasourceRequests={1}
          infiniteInitialRowCount={1000}
          maxBlocksInCache={10}
          pagination={true}
          onGridReady={onGridReady}
        />
    </div>

    </>
  )
}

export default App
