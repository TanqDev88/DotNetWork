using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Proyecto_PrimerParcial.Utils;

namespace Proyecto_PrimerParcial.Models
{
    public class Pista
    {
        
        public int PistaId { get; set; }
        public string? PistaNombre {get;set;}
        public int PistaNomenclatura {get;set;}
        public PistaType PistaCapacidad { get; set; }
        public bool PistaIluminacion {get;set;} = true;
        public bool PistaAprovisionamiento {get;set;} = true;
        public virtual List<Hangar> Hangars {get;set;}
    }
}