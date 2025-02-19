
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";
import { formatDate, formatAmount } from "@/lib/contract";
import { Link } from "react-router-dom";

interface TaskCardProps {
  id: number;
  description: string;
  bounty: bigint;
  deadline: number;
  isCompleted: boolean;
  isCancelled: boolean;
}

export const TaskCard = ({ id, description, bounty, deadline, isCompleted, isCancelled }: TaskCardProps) => {
  const getStatusBadge = () => {
    if (isCompleted) return <Badge className="bg-green-500">Completed</Badge>;
    if (isCancelled) return <Badge variant="destructive">Cancelled</Badge>;
    if (Date.now() > deadline * 1000) return <Badge variant="secondary">Expired</Badge>;
    return <Badge className="bg-blue-500">Active</Badge>;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Task #{id}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>{formatAmount(bounty)} ETN</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>{formatDate(deadline)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link to={`/tasks/${id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
