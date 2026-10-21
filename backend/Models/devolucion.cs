using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class devolucion
{
    public int id { get; set; }

    public string motivo { get; set; } = null!;

    public DateOnly fechasolicitud { get; set; }

    public DateOnly? fecharesolucion { get; set; }

    public string estado { get; set; } = null!;

    public string tipodevolucion { get; set; } = null!;

    public int? montoreintegrado { get; set; }

    public virtual ICollection<generar1> generar1s { get; set; } = new List<generar1>();
}
