import {useState, useRef, useMemo, } from 'react'
import axios from 'axios'
import { AgGridReact } from 'ag-grid-react';
import { InfiniteRowModelModule, EventApiModule, provideGlobalGridOptions , CustomFilterModule ,  ModuleRegistry } from 'ag-grid-community'; 
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme CSS

ModuleRegistry.registerModules([ InfiniteRowModelModule, EventApiModule, CustomFilterModule ]); 

provideGlobalGridOptions({
  theme: "legacy",
});

function App() {

  const gridRef = useRef(null); // Reference to the grid
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

  const fetchData = async (startRow, endRow) => {
    // Simulate an API call
    try{
      const response = await axios(
        `https://json-server-vercel-inky.vercel.app/users?_start=${startRow}&_limit=${endRow - startRow}`
      );
      const data = response.data;
      return data.map((item) => {
        return {
          id:item.id,
          name:item.name,
          username:item.username,
          email:item.email,
          city:item.address?.city
        }
      });
      
    }catch(err){
      console.error('Error fetching data:', err);
      return [];
    }
  
  };

  const onGridReady = async(params) => {
    
    const dataSource = {
      getRows: async (params) => {
        // Show loading indicator
        gridRef.current.api.setGridOption("loading", true);
        // Fetch data from API
        const data = await fetchData(params.startRow, params.endRow);
        // Supply rows to the grid
        params.successCallback(data, 50); // Total rows count
        // Hide loading indicator
        gridRef.current.api.setGridOption("loading", false);
      },
      
    };
    params.api.setGridOption("datasource", dataSource);
  };

  return (
    <><div style={{ width: '100%', height: '100vh' }}>
    <h1 style={{ textAlign: 'center' }}>AG Grid Infinite Scroll</h1>
    <div className="ag-theme-alpine" style={{ height: '90%', width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        rowModelType="infinite" // Enable Infinite Row Model
        cacheBlockSize={10} // Fetch 10 rows at a time
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        overlayLoadingTemplate="<span class='ag-overlay-loading-center'>Loading...</span>"
        overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>No rows to display</span>"
      />
    </div>
  </div>
    </>
  )
}

export default App
