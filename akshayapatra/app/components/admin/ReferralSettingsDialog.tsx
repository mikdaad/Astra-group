'use client';

import { useState, useEffect } from 'react';
import { useRBAC } from '@/hooks/useRBAC';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Edit2, Save, X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

interface ReferralLevel {
  id: string;
  level: number;
  commission_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ReferralSettingsDialogProps {
  onLevelsUpdate?: () => void;
}

export default function ReferralSettingsDialog({ onLevelsUpdate }: ReferralSettingsDialogProps) {
  const { hasPermission } = useRBAC();
  const [levels, setLevels] = useState<ReferralLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState({
    level: 1,
    commission_percentage: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [open, setOpen] = useState(false);
  const supabase = createClient();

  // Check permissions
  const canViewSettings = hasPermission('referrals:settings');
  const canManageLevels = hasPermission('referrals:levels:manage');

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('referral_levels')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      setLevels(data || []);
    } catch (error) {
      console.error('Error fetching levels:', error);
      setError('Failed to fetch referral levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && canViewSettings) {
      fetchLevels();
    }
  }, [open, canViewSettings]);

  const getAvailableLevels = () => {
    const existingLevels = levels.map(l => l.level);
    const allLevels = [1, 2];
    return allLevels.filter(level => !existingLevels.includes(level));
  };

  const handleAddLevel = async () => {
    setError(null);
    setSuccess(null);
    if (!canManageLevels) {
      setError('You do not have permission to manage referral levels.');
      return;
    }

    if (newLevel.commission_percentage < 0 || newLevel.commission_percentage > 100) {
      setError('Commission percentage must be between 0 and 100');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('referral_levels')
        .insert([{
          level: newLevel.level,
          commission_percentage: newLevel.commission_percentage,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setLevels([...levels, data]);
      setNewLevel({ level: 1, commission_percentage: 0 });
      setShowAddForm(false);
      setSuccess('Referral level created successfully');
      toast.success('Referral level created successfully');
      onLevelsUpdate?.();
    } catch (error) {
      console.error('Error creating level:', error);
      setError('Failed to create referral level');
      toast.error('Failed to create referral level');
    }
  };

  const handleUpdateLevel = async (id: string, commission_percentage: number) => {
    setError(null);
    setSuccess(null);
    if (!canManageLevels) {
      setError('You do not have permission to manage referral levels.');
      return;
    }

    if (commission_percentage < 0 || commission_percentage > 100) {
      setError('Commission percentage must be between 0 and 100');
      return;
    }

    try {
      const { error } = await supabase
        .from('referral_levels')
        .update({ commission_percentage })
        .eq('id', id);

      if (error) throw error;

      setLevels(levels.map(level => 
        level.id === id ? { ...level, commission_percentage } : level
      ));
      setEditingId(null);
      setSuccess('Commission percentage updated successfully');
      toast.success('Commission percentage updated successfully');
      onLevelsUpdate?.();
    } catch (error) {
      console.error('Error updating level:', error);
      setError('Failed to update commission percentage');
      toast.error('Failed to update commission percentage');
    }
  };



  if (!canViewSettings) {
    return null;
  }

  const availableLevels = getAvailableLevels();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Settings className="w-4 h-4 mr-2" />
          Manage Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#1a120c] border-orange-600/30 text-white">
        <DialogHeader>
          <DialogTitle>Referral Settings</DialogTitle>
          <DialogDescription>
            Manage referral levels and commission structures
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add Level Button */}
          {canManageLevels && availableLevels.length > 0 && (
            <div className="flex justify-end">
              <Button 
                onClick={() => setShowAddForm(true)}
                disabled={showAddForm}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Level
              </Button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded border border-red-600 bg-red-600/10 p-3 text-red-300">
              <div className="flex items-center justify-between gap-4">
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-red-300 hover:text-red-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded border border-green-600 bg-green-600/10 p-3 text-green-300">
              <div className="flex items-center justify-between gap-4">
                <span>{success}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuccess(null)}
                  className="text-green-300 hover:text-green-100"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add New Level Form */}
          {showAddForm && canManageLevels && (
            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardHeader>
                <CardTitle>Add New Referral Level</CardTitle>
                <CardDescription>
                  Create a new referral level (Maximum 2 levels allowed)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={newLevel.level.toString()} 
                      onValueChange={(value) => setNewLevel({...newLevel, level: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLevels.map(level => (
                          <SelectItem key={level} value={level.toString()}>
                            Level {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="commission">Commission Percentage</Label>
                    <Input
                      id="commission"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={newLevel.commission_percentage}
                      onChange={(e) => setNewLevel({...newLevel, commission_percentage: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddLevel}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Level
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false);
                      setNewLevel({ level: 1, commission_percentage: 0 });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
            </div>
          )}

          {/* Existing Levels */}
          {!loading && (
            <div className="space-y-3">
              {levels.map((level) => (
                <Card key={level.id} className="bg-zinc-900/50 border-zinc-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge variant="default">
                          Level {level.level}
                        </Badge>
                        <div className="flex-1">
                          <h3 className="font-semibold">Level {level.level}</h3>
                          {editingId === level.id ? (
                            <div className="flex items-center space-x-2 mt-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={level.commission_percentage}
                                onChange={(e) => {
                                  const newPercentage = parseFloat(e.target.value) || 0;
                                  setLevels(levels.map(l => 
                                    l.id === level.id ? { ...l, commission_percentage: newPercentage } : l
                                  ));
                                }}
                                className="w-24"
                              />
                              <span className="text-sm text-zinc-400">%</span>
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-400">
                              {level.commission_percentage}% Commission
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                        {canManageLevels && (
                          <div className="flex space-x-1">
                            {editingId === level.id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateLevel(level.id, level.commission_percentage)}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingId(null);
                                    fetchLevels();
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(level.id)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && levels.length === 0 && (
            <Card className="bg-zinc-900/50 border-zinc-700">
              <CardContent className="p-8 text-center">
                  <p className="text-zinc-300">
                    No referral levels configured yet.
                    {canManageLevels && ' Click "Add Level" to create your first referral level.'}
                  </p>
                </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}