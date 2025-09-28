"use client";

import useSWR from "swr";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  TreePine, 
  Waves, 
  Leaf, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  Clock, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Shield,
  AlertTriangle,
  FileText
} from "lucide-react";
import { contractService } from "@/lib/contracts";
import { CONTRACT_ROLES } from "@/lib/web3";
import type { PlantationData } from "@/types/contracts";
import { toast } from "sonner";
import { useAccount } from "wagmi";

const ITEMS_PER_PAGE = 3;

type SortField = "date" | "area" | "type" | "id";
type SortOrder = "asc" | "desc";
type EcosystemFilter = "all" | "mangroves" | "seagrass" | "saltmarsh";

async function fetchPlantations(): Promise<PlantationData[]> {
  return contractService.getAllPlantations();
}

export default function VerificationPage() {
  const { address } = useAccount();
  const { data: plantations, isLoading, mutate } = useSWR<PlantationData[]>("plantations", fetchPlantations);
  
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<EcosystemFilter>("all");
  const [sortBy, setSortBy] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pendingCurrentPage, setPendingCurrentPage] = useState<number>(1);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const getEcosystemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mangroves': 
        return <TreePine className="w-4 h-4 text-green-600" />;
      case 'seagrass': 
        return <Waves className="w-4 h-4 text-blue-600" />;
      case 'saltmarsh': 
        return <Leaf className="w-4 h-4 text-yellow-600" />;
      default: 
        return <Leaf className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredAndSortedPlantations = useMemo(() => {
    if (!plantations) return [];
    
    let filtered = plantations.filter((plantation: PlantationData) => {
      const matchesSearch = plantation.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plantation.ecosystemType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          plantation.implementer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === "all" || plantation.ecosystemType.toLowerCase() === filterType;
      
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a: PlantationData, b: PlantationData) => {
      let aVal: string | number | Date;
      let bVal: string | number | Date;
      
      switch (sortBy) {
        case "date":
          aVal = new Date(a.plantationDate);
          bVal = new Date(b.plantationDate);
          break;
        case "area":
          aVal = parseInt(a.area);
          bVal = parseInt(b.area);
          break;
        case "type":
          aVal = a.ecosystemType;
          bVal = b.ecosystemType;
          break;
        default:
          aVal = parseInt(a.id);
          bVal = parseInt(b.id);
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [plantations, searchTerm, filterType, sortBy, sortOrder]);

  const unverified = filteredAndSortedPlantations.filter((p: PlantationData) => !p.verified);
  const verified = filteredAndSortedPlantations.filter((p: PlantationData) => p.verified);

  const paginatedUnverified = unverified.slice(
    (pendingCurrentPage - 1) * ITEMS_PER_PAGE,
    pendingCurrentPage * ITEMS_PER_PAGE
  );

  const paginatedVerified = verified.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(verified.length / ITEMS_PER_PAGE);
  const pendingTotalPages = Math.ceil(unverified.length / ITEMS_PER_PAGE);
  const totalArea = plantations?.reduce((sum: number, p: PlantationData) => sum + parseInt(p.area), 0) || 0;

  const approve = async (id: string) => {
    try {
      setVerifyingId(id);
      const minted = await contractService.verifyPlantation(id);
      toast.success(
        `Plantation #${id} verified successfully. Credits minted: ${minted ?? 0}`
      );
      await mutate();
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const isAdmin = address && [
    CONTRACT_ROLES.OWNER.toLowerCase(),
    CONTRACT_ROLES.ADMIN.toLowerCase(),
  ].includes(address.toLowerCase());

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Alert className="border-destructive/50 text-destructive dark:border-destructive">
          <Shield className="h-4 w-4" />
          <AlertTitle>Restricted Access</AlertTitle>
          <AlertDescription>
            This dashboard is only for contract owner or admin. Please go back to{" "}
            <Link href="/" className="underline text-primary hover:text-primary/80">
              Home
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Verification Dashboard</h1>
            <p className="text-muted-foreground">Manage plantation verification and carbon credit approval</p>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{unverified.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified</p>
                  <p className="text-2xl font-bold text-foreground">{verified.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Area</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(totalArea / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}K
                  </p>
                  <p className="text-xs text-muted-foreground">sq meters</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold text-foreground">{plantations?.length || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by location, ecosystem, or implementer address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={(value) => setFilterType(value as EcosystemFilter)}>
                <SelectTrigger className="w-[100px] sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ecosystems</SelectItem>
                  <SelectItem value="mangroves">Mangroves</SelectItem>
                  <SelectItem value="seagrass">Seagrass</SelectItem>
                  <SelectItem value="saltmarsh">Salt Marsh</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortField)}>
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">By Date</SelectItem>
                  <SelectItem value="area">By Area</SelectItem>
                  <SelectItem value="type">By Type</SelectItem>
                  <SelectItem value="id">By ID</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Verification Section */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <CardTitle>Pending Verification</CardTitle>
            </div>
            <Badge variant={unverified.length > 0 ? "destructive" : "secondary"} className="text-nowrap">
              {unverified.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Clock className="w-6 h-6 animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Loading Plantations...</p>
            </div>
          ) : unverified.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No plantations awaiting verification</p>
              <p className="text-sm text-muted-foreground">All submitted plantations have been processed</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {paginatedUnverified.map((plantation: PlantationData) => {
                  const dateInfo = formatDate(plantation.plantationDate);
                  return (
                    <Card key={plantation.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline" className="font-mono">
                                #{plantation.id}
                              </Badge>
                              <div className="flex items-center gap-2">
                                {getEcosystemIcon(plantation.ecosystemType)}
                                <span className="font-semibold capitalize">
                                  {plantation.ecosystemType}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{plantation.location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                                <span>{parseInt(plantation.area).toLocaleString('en-IN')} sq meters</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>{dateInfo.date} at {dateInfo.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span className="font-mono text-sm">
                                  {formatAddress(plantation.implementer)}
                                </span>
                              </div>
                            </div>
                            
                            {plantation.ipfsHash && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">IPFS: </span>
                                <span className="font-mono">{plantation.ipfsHash}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-end">
                            <Button
                              onClick={() => approve(plantation.id)}
                              disabled={verifyingId === plantation.id}
                              className="w-full sm:min-w-[120px]"
                            >
                              {verifyingId === plantation.id ? (
                                <>
                                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Approve
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Pagination for Pending */}
              {pendingTotalPages > 1 && (
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pendingCurrentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(pendingCurrentPage * ITEMS_PER_PAGE, unverified.length)} of {unverified.length} pending plantations
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingCurrentPage(Math.max(1, pendingCurrentPage - 1))}
                      disabled={pendingCurrentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pendingTotalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === pendingTotalPages || 
                          Math.abs(page - pendingCurrentPage) <= 1
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={page === pendingCurrentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPendingCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingCurrentPage(Math.min(pendingTotalPages, pendingCurrentPage + 1))}
                      disabled={pendingCurrentPage === pendingTotalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verified Plantations Section */}
      {verified.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <CardTitle>Verified Plantations</CardTitle>
              </div>
              <Badge variant="secondary" className="text-nowrap">
                {verified.length} Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedVerified.map((plantation: PlantationData) => {
                  const dateInfo = formatDate(plantation.plantationDate);
                  return (
                    <Card key={plantation.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-mono text-xs">
                              #{plantation.id}
                            </Badge>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getEcosystemIcon(plantation.ecosystemType)}
                            <span className="font-medium capitalize text-sm">
                              {plantation.ecosystemType}
                            </span>
                          </div>
                          
                          <div className="flex items-center flex-wrap gap-3 space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span>{plantation.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BarChart3 className="w-3 h-3" />
                              <span>{parseInt(plantation.area).toLocaleString('en-IN')} sq m</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              <span>{dateInfo.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3" />
                              <span className="font-mono">
                                {formatAddress(plantation.implementer)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, verified.length)} of {verified.length} verified plantations
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages || 
                          Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, array) => (
                          <React.Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          </React.Fragment>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}