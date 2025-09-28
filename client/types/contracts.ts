export interface PlantationData {
  id: string
  location: string
  area: string
  ecosystemType: string
  plantationDate: string
  implementer: string
  verified: boolean
  ipfsHash: string
}

export interface MonitoringReport {
  id: string
  plantationId: string
  reporter: string
  reportDate: string
  survivalRate: string
  biomass: string
  carbonSequestered: string
  dataSource: string
  ipfsHash: string
  verified: boolean
  creditsGenerated: string
}
