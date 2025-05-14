export default function DashboardPage() {
    return (
      <div className="container">
        <h1>User Analytics</h1>
        
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h3>Top Posts</h3>
                {/* Графики можно реализовать с помощью Chart.js или ApexCharts */}
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h3>Activity Stats</h3>
                {/* Статистика */}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }