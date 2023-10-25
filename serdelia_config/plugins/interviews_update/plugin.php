<?php

class serdelia_plugin_interviews_update
{
    // ------------------------------------------------------------------------------

   public function __construct($cms,$params,$parent)
    {
        $this->cms=$cms;
        $this->params=$params;
        $this->parent=$parent;
    }
    // ------------------------------------------------------------------------------
    public function getData()
    {
        
        $errors=[];
        $success=[];
        $params=$this->params;

        
        $this->cms->setFilesDecache(false);
        $this->parent->orm->setFilesDecache(false);

        $query="
        UPDATE events SET active=0;
        UPDATE events,interviews_indexes SET events.active=1 WHERE interviews_indexes.index_type='events' && interviews_indexes.index_id=events.id;
        
        UPDATE people SET active=0;
        UPDATE people,interviews_indexes SET people.active=1 WHERE interviews_indexes.index_type='people' && interviews_indexes.index_id=people.id;
        
        UPDATE locations SET active=0;
        UPDATE locations,interviews_indexes SET locations.active=1 WHERE interviews_indexes.index_type='locations' && interviews_indexes.index_id=locations.id;
        
        UPDATE organizations SET active=0;
        UPDATE organizations,interviews_indexes SET organizations.active=1 WHERE interviews_indexes.index_type='organizations' && interviews_indexes.index_id=organizations.id;";
        
        $this->cms->queryMultiOut($query);

        $success[]='Indexes updated';

        $data=['result'=>true,'success'=>$success,'errors'=>$errors];
        
        return $data;
    }



}


?>