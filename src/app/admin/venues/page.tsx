'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Search, MoreVertical, Ban, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { AuroraBackground } from '@/components/layout/aurora-background'
import { useTranslations } from '@/i18n/client'

interface Venue {
  id: string
  name: string
  area: string
  midtransStatus: 'LIVE' | 'TEST' | 'NOT_CONNECTED'
  status: 'ACTIVE' | 'BLOCKED'
  totalVolume: number
  lastActivity: string
  staffCount: number
}

export default function AdminVenuesPage() {
  const t = useTranslations('admin.venues')
  const [venues, setVenues] = useState<Venue[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    // Mock data for development
    setVenues([
      {
        id: '1',
        name: 'Cafe Organic Canggu',
        area: 'Canggu',
        midtransStatus: 'LIVE',
        status: 'ACTIVE',
        totalVolume: 45000000,
        lastActivity: '2 mins ago',
        staffCount: 8
      },
      {
        id: '2',
        name: 'Potato Head Beach Club',
        area: 'Seminyak',
        midtransStatus: 'LIVE',
        status: 'ACTIVE',
        totalVolume: 128500000,
        lastActivity: '5 mins ago',
        staffCount: 24
      },
      {
        id: '3',
        name: 'Revolver Espresso',
        area: 'Seminyak',
        midtransStatus: 'TEST',
        status: 'ACTIVE',
        totalVolume: 0,
        lastActivity: '1 hour ago',
        staffCount: 4
      },
      {
        id: '4',
        name: 'La Brisa',
        area: 'Canggu',
        midtransStatus: 'LIVE',
        status: 'BLOCKED',
        totalVolume: 67200000,
        lastActivity: '3 days ago',
        staffCount: 15
      },
      {
        id: '5',
        name: 'Milk & Madu',
        area: 'Ubud',
        midtransStatus: 'NOT_CONNECTED',
        status: 'ACTIVE',
        totalVolume: 0,
        lastActivity: 'Never',
        staffCount: 0
      }
    ])
  }

  const handleBlock = async (venueId: string) => {
    setVenues(venues.map(v => 
      v.id === venueId ? { ...v, status: v.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' } : v
    ))
  }

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(search.toLowerCase()) ||
                         venue.area.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'live' && venue.midtransStatus === 'LIVE' && venue.status === 'ACTIVE') ||
                         (statusFilter === 'test' && venue.midtransStatus === 'TEST') ||
                         (statusFilter === 'blocked' && venue.status === 'BLOCKED')
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(amount)
  }

  const getMidtransStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">🟢 {t('liveStatus')}</Badge>
      case 'TEST':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">🟡 {t('testStatus')}</Badge>
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">⚪ {t('notConnected')}</Badge>
    }
  }

  return (
    <AuroraBackground>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-heading font-bold text-white">{t('title')}</h1>
            </div>
            <p className="text-muted-foreground">{t('subtitle')}</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allVenues')}</SelectItem>
                  <SelectItem value="live">{t('live')}</SelectItem>
                  <SelectItem value="test">{t('testMode')}</SelectItem>
                  <SelectItem value="blocked">{t('blocked')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>


          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('allVenues')}</p>
              <p className="text-2xl font-bold text-white">{venues.length}</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('live')}</p>
              <p className="text-2xl font-bold text-green-400">
                {venues.filter(v => v.midtransStatus === 'LIVE' && v.status === 'ACTIVE').length}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('testMode')}</p>
              <p className="text-2xl font-bold text-yellow-400">
                {venues.filter(v => v.midtransStatus === 'TEST').length}
              </p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{t('blocked')}</p>
              <p className="text-2xl font-bold text-red-400">
                {venues.filter(v => v.status === 'BLOCKED').length}
              </p>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('venue')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('midtrans')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('totalVolume')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('staffCount')}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('lastActivity')}</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVenues.map((venue, index) => (
                    <motion.tr
                      key={venue.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                        venue.status === 'BLOCKED' ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{venue.name}</p>
                          <p className="text-sm text-muted-foreground">{venue.area}</p>
                        </div>
                      </td>
                      <td className="p-4">{getMidtransStatusBadge(venue.midtransStatus)}</td>
                      <td className="p-4">
                        <span className="text-primary font-medium">Rp {formatCurrency(venue.totalVolume)}</span>
                      </td>
                      <td className="p-4 text-white">{venue.staffCount}</td>
                      <td className="p-4 text-muted-foreground">{venue.lastActivity}</td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass border-white/10">
                            <DropdownMenuItem className="cursor-pointer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              {t('viewDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleBlock(venue.id)}
                            >
                              {venue.status === 'BLOCKED' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                                  <span className="text-green-400">{t('unblock')}</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4 mr-2 text-red-400" />
                                  <span className="text-red-400">{t('block')}</span>
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </AuroraBackground>
  )
}
