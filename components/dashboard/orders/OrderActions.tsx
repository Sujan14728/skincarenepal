import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

type Props = {
  onView?: () => void;
  onDelete?: () => void;
  onEmail?: () => void;
};

const OrderActions = ({ onView, onDelete, onEmail }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <MoreHorizontal className='text-muted-foreground h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
        <DropdownMenuItem onClick={onEmail}>Send Email</DropdownMenuItem>
        {/* Placeholder for future edit */}
        {/* <DropdownMenuItem onClick={onEdit}>Edit Order</DropdownMenuItem> */}
        <DropdownMenuItem onClick={onDelete} className='text-destructive'>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderActions;
