<?php


class view_app extends _uho_view
{

    public function cut($html,$id)
    {
        $i1=strpos($html,'<p>[['.$id.']]</p>');
        $i2=strpos($html,'<p>[[/'.$id.']]</p>');

        if ($i1 && $i2>$i1) return array
          (
            substr($html,0,$i1),
            substr($html,$i1+11+strlen($id),$i2-$i1-strlen($id)-11),
            substr($html,$i2+12+strlen($id))
            );

    }
    public function p2array($cut)
    {
        $d = explode('</p>',$cut);
        foreach ($d as $k=>$v)
        {
          $v=str_replace('<p>','',$v);
          $v=str_replace(chr(13),'',$v);
          $v=str_replace(chr(10),'',$v);
          if ($v) $d[$k]=$v; else unset($d[$k]);
        }
        return $d;

    }
    //=========================================================================================
    private function contentReplace($html,$start1,$start2,$end1,$end2)
    {

      while ($i1=strpos($html,$start1))
      {
       $i2=strpos($html,$end1,$i1);
       if (!$i2) $i2=strlen($html);
       $content=$start2.substr($html,$i1+strlen($start1),$i2-$i1-strlen($start1)).$end2;
       $html=substr($html,0,$i1).$content.substr($html,$i2+strlen($end1));
      }

      return $html;
    }


    public function getHtml($data)
    {
     $view_name=@$data['view'];
      $data['content']=$this->getContentHtml($data['content'],$data['view']);
      $data['content_outside']='';
      $data['content']=str_replace("","",$data['content']); // strange char remover [L SEP]

      // <!-- aside --> move

      $aside='';

      while ($i1=strpos($data['content'],'<!-- aside -->'))
      {
       $i2=strpos($data['content'],'<!-- /aside -->') ;
       if (!$i2) $i2=strlen($data['content']);
       $aside.=substr($data['content'],$i1,$i2-$i1+17);
       $data['content']=substr($data['content'],0,$i1).substr($data['content'],$i2+17);
      }

      $data['content']=str_replace('<!-- paste_aside_here -->',$aside,$data['content']);

      // <!-- outside --> move

      while ($i1=strpos($data['content'],'<!-- outside -->'))
      {
       $i2=strpos($data['content'],'<!-- /outside -->') ;
       if (!$i2) $i2=strlen($data['content']);
       $data['content_outside'].=substr($data['content'],$i1,$i2-$i1+17);
       $data['content']=substr($data['content'],0,$i1).substr($data['content'],$i2+17);
      }

      // render whole page

      if ($this->renderHtmlRoot)
      {
        $html=$this->getTwig('',$data);
      }
      // render content only
      else
      {
        $html=$data['content'];
      }


      // sprite
      $pattern = "/\[\[sprite\::([a-z0-9-_]+)\]\]/";
      $replacement = '<svg class="sprite-$1"><use xlink:href="#sprite-$1"/></svg>';
      $html = preg_replace($pattern, $replacement, $html);

      // ------------------------------------------------------------------------------------------
      // svg
      $nr=0;
      $svgs=[];
      while ($i=strpos($html,'[[svg::'))
      {

        $j=strpos($html,']]',$i);
        $svg=substr($html,$i+7,$j-$i-7);
        if (isset($svgs[$svg])) $data=$svgs[$svg];
        else
        {
          $o=$svg;
            if (strpos($svg,'.svg'))
              $filename=$_SERVER['DOCUMENT_ROOT'].$svg;
              else
              $filename=$_SERVER['DOCUMENT_ROOT'].'/application/views/svg/'.$svg.'.svg';

            $data=@file_get_contents($filename);
            if (!$data && $this->renderHtmlRoot) echo('<!-- SVG NOT FOUND::'.$filename.' IN '.$view_name.' ... '.substr($html,$i,100).' -->');
            $svgs[$svg]=$data;
        }

        $nr++;
        //$data=str_replace('"a"','"a'.$nr.'"',$data);
        //$data=str_replace('"url(#a)"','"url(#a'.$nr.')"',$data);

        if ($svg=='flirtuj_EN') $svg='flirtuj';

        $data=str_replace('<svg','<svg class="svg-'.$svg.'" ',$data);
        $html=substr($html,0,$i).$data.substr($html,$j+2);
      }


      return $html;
    }





}

?>
