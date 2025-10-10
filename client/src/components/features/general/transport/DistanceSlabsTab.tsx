import { useState } from "react";
import { Plus, DollarSign, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DistanceSlabFormDialog from "./DistanceSlabFormDialog";

interface DistanceSlabsTabProps {
  slabsData: any[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateSlab: (data: any) => void;
  onUpdateSlab: (data: any) => void;
  createFeeMutation: any;
  updateFeeMutation: any;
}

const DistanceSlabsTab = ({
  slabsData,
  searchTerm,
  onSearchChange,
  onCreateSlab,
  onUpdateSlab,
  createFeeMutation,
  updateFeeMutation,
}: DistanceSlabsTabProps) => {
  const [isAddFeeOpen, setIsAddFeeOpen] = useState(false);
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);
  const [editFeeId, setEditFeeId] = useState<number | null>(null);

  const filteredSlabs = slabsData.filter(
    (slab) =>
      slab.slab_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleAddSlab = (data: any) => {
    createFeeMutation.mutate(data);
    setIsAddFeeOpen(false);
  };

  const handleUpdateSlab = (data: any) => {
    updateFeeMutation.mutate(data);
    setIsEditFeeOpen(false);
    setEditFeeId(null);
  };

  const handleEditSlab = (slab: any) => {
    setEditFeeId(slab.slab_id);
    setIsEditFeeOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search transport fees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">
            {filteredSlabs.length} Distance Slabs
          </Badge>
        </div>
        <Dialog open={isAddFeeOpen} onOpenChange={setIsAddFeeOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Fee
            </Button>
          </DialogTrigger>
          <DistanceSlabFormDialog
            isOpen={isAddFeeOpen}
            onClose={() => setIsAddFeeOpen(false)}
            onSubmit={handleAddSlab}
            isEditing={false}
          />
        </Dialog>
      </div>

      {slabsData.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No distance slabs found. Click "Add Fee" to create one.
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Slab</TableHead>
              <TableHead>Range</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSlabs.map((slab) => (
              <TableRow key={slab.slab_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{slab.slab_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {slab.min_distance} - {slab.max_distance || '∞'} km
                </TableCell>
                <TableCell className="text-right font-semibold text-green-700">
                  ₹{slab.fee_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSlab(slab)}
                      title="Edit slab"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Add delete functionality here
                      }}
                      className="text-red-600 hover:text-red-700"
                      title="Delete slab"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Fee Dialog */}
      <DistanceSlabFormDialog
        isOpen={isEditFeeOpen}
        onClose={() => {
          setIsEditFeeOpen(false);
          setEditFeeId(null);
        }}
        onSubmit={handleUpdateSlab}
        isEditing={true}
        editingSlab={editFeeId ? slabsData.find(s => s.slab_id === editFeeId) : undefined}
      />
    </div>
  );
};

export default DistanceSlabsTab;
