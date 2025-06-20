declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Shield, Zap, AlertTriangle, Search, User, Clock, Hash, FileText, Wallet, Activity, ChevronRight, CheckCircle2, AlertCircle, ExternalLink, Info } from 'lucide-react';

// Contract ABI 
const abi: any[] = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "reportedBy",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "IncidentReported",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_id",
        "type": "uint256"
      }
    ],
    "name": "getIncident",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "incidentCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "incidents",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "reportedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      }
    ],
    "name": "reportIncident",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "0xf12eAD27305b91A03AFBb413A2eD2F028e4C9E6b";

function App() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [description, setDescription] = useState('');
  const [incidentId, setIncidentId] = useState('');
  const [fetchedIncident, setFetchedIncident] = useState<any>(null);
  const [reportedIncident, setReportedIncident] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'search'>('report');

  // Animation states
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (reportedIncident) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [reportedIncident]);

  // important functions
  //
  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to continue");
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const signer = await browserProvider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      setContract(contract);
      setWalletAddress(accounts[0]);
    } catch (error) {
      alert("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  // Report Incident
  const handleReportIncident = async (): Promise<void> => {
    if (!contract) return alert("Connect wallet first");
    if (!description.trim()) return alert("Please enter a description");

    setIsLoading(true);
    try {
      const tx = await contract.reportIncident(description);

      
      const receipt = await tx.wait();

      // Extracting event data from the receipt
      const incidentData = {
        id: receipt.logs[0].args[0].toString(),
        description: receipt.logs[0].args[1],
        reportedBy: receipt.logs[0].args[2],
        timestamp: new Date(Number(receipt.logs[0].args[3]) * 1000).toLocaleString(),
        txHash: tx.hash
      };

      setReportedIncident(incidentData);
      setDescription('');

    } catch (error: any) {
      console.error("Error reporting incident:", error);
      alert("Error reporting incident: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Get Incident by ID
  const handleFetchIncident = async () => {
    if (!contract) return alert("Connect wallet first");
    if (!incidentId) return alert("Please enter an incident ID");

    setIsLoading(true);
    try {
      const data = await contract.getIncident(Number(incidentId));
      setFetchedIncident(data);
    } catch (err) {
      alert("Error fetching incident - ID may not exist");
    } finally {
      setIsLoading(false);
    }
  };

  ////

  //frontend

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-4 mb-6">
            {/* Filecoin-inspired logo */}
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold text-gray-900">SecureReport</h1>
              <p className="text-sm text-blue-600 font-medium">Powered by Filecoin Network</p>
            </div>
          </div>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Decentralized incident reporting system built on Filecoin blockchain.
            Report and track incidents with complete transparency and immutability.
          </p>

          {/* Network Info Alert */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm text-amber-800 font-medium">Network Requirement</p>
                  <p className="text-sm text-amber-700">
                    Please connect to <strong>Filecoin Calibration Testnet</strong> to report incidents and interact with the contract.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Contract Address</p>
                  <p className="text-xs font-mono text-gray-600 mt-1">{contractAddress}</p>
                </div>
                <a
                  href={`https://calibration.filfox.info/en/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                >
                  View on Filscan
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex justify-center mb-8">
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
              >
                <Wallet className="w-5 h-5" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-green-800">
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {showSuccess && reportedIncident && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Incident Reported Successfully!</h3>
                <p className="text-gray-600 mb-4">Your incident has been recorded on the blockchain.</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Incident ID:</span> #{reportedIncident.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'report'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Report Incident
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'search'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Search className="w-4 h-4" />
                Search Incident
              </button>
            </div>
          </div>

          {/* Report Tab */}
          {activeTab === 'report' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Report New Incident</h2>
                    <p className="text-sm text-gray-600">Submit a detailed incident report to the blockchain</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Description *
                  </label>
                  <textarea
                    rows={6}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                    placeholder="Provide a detailed description of the incident. Include what happened, when it occurred, location, and any relevant details that would help in understanding the situation..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Please be as detailed and accurate as possible</p>
                    <span className="text-xs text-gray-400">{description.length}/1000</span>
                  </div>
                </div>

                <button
                  onClick={handleReportIncident}
                  disabled={isLoading || !contract || !description.trim()}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Activity className="w-5 h-5 animate-spin" />
                      Processing Transaction...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Submit Incident Report
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* Recent Report Display */}
              {reportedIncident && !showSuccess && (
                <div className="mx-6 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-green-800">Incident Successfully Reported</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">ID:</span>
                      <span className="font-mono text-green-800">#{reportedIncident.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Time:</span>
                      <span className="text-green-800">{reportedIncident.timestamp}</span>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">Reporter:</span>
                      <span className="font-mono text-green-800 text-xs">{reportedIncident.reportedBy}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Search Incidents</h2>
                    <p className="text-sm text-gray-600">Find and view previously reported incidents</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident ID
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter incident ID (e.g., 1, 2, 3...)"
                      value={incidentId}
                      onChange={(e) => setIncidentId(e.target.value)}
                      min="1"
                    />
                    <button
                      onClick={handleFetchIncident}
                      disabled={isLoading || !contract || !incidentId.trim()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Activity className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {fetchedIncident && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="font-medium text-blue-800">Incident Details</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700 font-medium">ID:</span>
                        <span className="font-mono text-blue-800">#{fetchedIncident[0].toString()}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2 text-sm">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 font-medium">Description:</span>
                        </div>
                        <div className="p-4 bg-white border border-gray-200 rounded-lg">
                          <p className="text-gray-800 leading-relaxed">{fetchedIncident[1]}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 font-medium">Reporter:</span>
                          <span className="font-mono text-blue-800 text-xs">{fetchedIncident[2]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700 font-medium">Time:</span>
                          <span className="text-blue-800">{new Date(Number(fetchedIncident[3]) * 1000).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Secured by Filecoin Blockchain • Transparent • Immutable • Decentralized
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Built for the Filecoin ecosystem with trust and transparency at its core
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;