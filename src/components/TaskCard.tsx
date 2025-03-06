
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, User } from "lucide-react";
import { formatDate } from "@/lib/contract";
import { Link } from "react-router-dom";

interface TaskCardProps {
  id: number;
  title: string;
  description: string;
  bounty: number;
  deadline: string;
  category: string;
  skills: string[];
  isCompleted: boolean;
  isCancelled: boolean;
}

export const TaskCard = ({ 
  id, 
  title,
  description, 
  bounty, 
  deadline, 
  category,
  skills,
  isCompleted, 
  isCancelled 
}: TaskCardProps) => {
  const getStatusBadge = () => {
    if (isCompleted) return <Badge className="bg-green-500">Completed</Badge>;
    if (isCancelled) return <Badge variant="destructive">Cancelled</Badge>;
    if (new Date(deadline) < new Date()) return <Badge variant="secondary">Expired</Badge>;
    return <Badge className="bg-blue-500">Active</Badge>;
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <Badge variant="outline" className="mt-2">{category}</Badge>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription className="line-clamp-2 mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          <span>{bounty} ETN</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <span>{formatDate(Math.floor(new Date(deadline).getTime() / 1000))}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
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
