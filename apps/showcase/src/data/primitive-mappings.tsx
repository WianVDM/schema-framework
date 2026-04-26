import type {
	LayoutPrimitiveComponents,
	PrimitiveComponents,
} from "@my-framework/core";
import {
	AddressInput,
	DatePicker,
	FileUpload,
	Panel,
	Splitter,
	TagInput,
} from "@my-framework/core";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible } from "@/components/ui/collapsible";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const primitives: PrimitiveComponents = {
	Input,
	Label,
	Textarea,
	Checkbox,
	Button,
	Badge,
	Dialog,
	DialogContent,
	DialogTrigger,
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
	FileUpload,
	AddressInput,
	DatePicker,
	TagInput,
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
};

export const layoutPrimitives: LayoutPrimitiveComponents = {
	Panel,
	Splitter,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Accordion,
	AccordionItem,
	AccordionTrigger,
	AccordionContent,
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	Separator,
	Collapsible,
	ScrollArea,
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
};
